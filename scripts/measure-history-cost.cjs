// Mengurai biaya tiap bagian + prototipe query riwayat GABUNGAN (2 query untuk
// SEMUA gerakan, bukan 4 query x N gerakan). Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const t = async (label, fn) => {
  const t0 = Date.now();
  try {
    const r = await fn();
    console.log('  ' + label.padEnd(46) + ' ' + String(Date.now() - t0).padStart(6) + ' ms');
    return r;
  } catch (e) {
    console.log('  ' + label.padEnd(46) + ' GAGAL ' + (Date.now() - t0) + ' ms  ' + (e.code || '') + ' ' + String(e.message).split('\n')[0].slice(0, 90));
    throw e;
  }
};

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  console.log('user:', user.id, '\n=== biaya per bagian ===');

  const progs = await t('Q1 program + exercises + exercise', () =>
    prisma.program.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: { sortOrder: 'asc' },
      include: { exercises: { orderBy: { sortOrder: 'asc' }, include: { exercise: true } } },
    })
  );

  const exs = await t('Q2 pustaka gerakan (140 baris penuh)', () =>
    prisma.exercise.findMany({
      where: { isArchived: false, OR: [{ userId: null }, { userId: user.id }] },
      orderBy: [{ primaryMuscle: 'asc' }, { name: 'asc' }],
    })
  );

  const target = progs.find((p) => p.exercises.length >= 5) || progs[0];
  const ids = Array.from(new Set(target.exercises.map((pe) => pe.exerciseId)));
  console.log('\nprogram: ' + target.name + ' (' + ids.length + ' gerakan unik)');

  console.log('\n--- CARA LAMA: 4 query per gerakan (x ' + Math.ceil(ids.length / 8) + ' chunk) ---');
  const t0 = Date.now();
  try {
    const CHUNK = 8;
    for (let i = 0; i < ids.length; i += CHUNK) {
      await Promise.all(
        ids.slice(i, i + CHUNK).map(async (id) => {
          await Promise.all([
            prisma.sessionExercise.findFirst({ where: { userId: user.id, exerciseId: id, workoutSession: { isCompleted: true } }, orderBy: { performedAt: 'desc' }, include: { exercise: { select: { weightIncrement: true } }, sets: { orderBy: { setNumber: 'asc' } } } }),
            prisma.setLog.aggregate({ where: { userId: user.id, exerciseId: id, isCompleted: true }, _max: { estimated1RM: true } }),
            prisma.sessionExercise.findMany({ where: { userId: user.id, exerciseId: id, workoutSession: { isCompleted: true } }, orderBy: { performedAt: 'desc' }, take: 3, include: { sets: { where: { isCompleted: true }, orderBy: { setNumber: 'asc' } } } }),
            prisma.sessionExercise.findMany({ where: { userId: user.id, exerciseId: id, notes: { not: null }, workoutSession: { isCompleted: true } }, orderBy: { performedAt: 'desc' }, take: 5, select: { performedAt: true, notes: true } }),
          ]);
        })
      );
    }
    console.log('  cara lama TOTAL                          ' + String(Date.now() - t0).padStart(6) + ' ms  (' + ids.length * 4 + ' query)');
  } catch (e) {
    console.log('  cara lama TOTAL                          GAGAL ' + (Date.now() - t0) + ' ms  ' + (e.code || ''));
  }

  console.log('\n--- CARA BARU: 2 query untuk SEMUA gerakan ---');
  const t1 = Date.now();
  const sesi = await t('  A. sessionExercise semua gerakan (1 query)', () =>
    prisma.sessionExercise.findMany({
      where: { userId: user.id, exerciseId: { in: ids }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: 200,
      include: { sets: { orderBy: { setNumber: 'asc' } } },
    })
  );
  const agg = await t('  B. best1RM groupBy (1 query)', () =>
    prisma.setLog.groupBy({
      by: ['exerciseId'],
      where: { userId: user.id, exerciseId: { in: ids }, isCompleted: true },
      _max: { estimated1RM: true },
    })
  );
  console.log('  cara baru TOTAL                          ' + String(Date.now() - t1).padStart(6) + ' ms  (2 query)');
  console.log('  baris sesi terambil: ' + sesi.length + ', gerakan dengan 1RM: ' + agg.length);

  // Bangun peta riwayat dari 2 query itu
  const map = {};
  for (const id of ids) map[id] = { previousSets: [], best1RM: 0, avgSets: [], noteHistory: [] };
  for (const a of agg) map[a.exerciseId].best1RM = a._max.estimated1RM || 0;
  const perEx = {};
  for (const s of sesi) (perEx[s.exerciseId] ||= []).push(s);
  let totalSets = 0, totalNotes = 0;
  for (const id of ids) {
    const rows = perEx[id] || [];
    if (rows[0]) {
      map[id].previousSets = rows[0].sets.map((s) => ({ setNumber: s.setNumber, weight: s.weight, reps: s.reps }));
      totalSets += rows[0].sets.length;
    }
    for (const r of rows.slice(0, 3)) {
      if (map[id].noteHistory.length < 5 && r.notes) map[id].noteHistory.push({ date: r.performedAt, notes: r.notes });
    }
    totalNotes += map[id].noteHistory.length;
  }
  console.log('  peta terbentuk: ' + ids.length + ' gerakan, ' + totalSets + ' set sesi terakhir, ' + totalNotes + ' catatan');
  console.log('  contoh: ' + ids[0].slice(0, 8) + ' -> previousSets=' + map[ids[0]].previousSets.length + ' best1RM=' + map[ids[0]].best1RM);

  await prisma.$disconnect();
})().catch((e) => { console.error('FATAL:', e.code || '', String(e.message).split('\n')[0].slice(0, 200)); process.exit(1); });
