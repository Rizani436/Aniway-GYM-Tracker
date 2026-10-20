// Mengukur jalur data /workout?programId=X persis seperti
// getWorkoutInitialDataAction — untuk membuktikan apakah action-nya GAGAL
// (page menelan error via .catch(() => null) -> mode offline -> gerakan kosong).
//
// Hanya BACA. Tidak ada penulisan.
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function getExerciseHistoryForUser(userId, exerciseId, targetRepMax) {
  const [last, agg, recent, notes] = await Promise.all([
    prisma.sessionExercise.findFirst({
      where: { userId, exerciseId, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      include: { exercise: { select: { weightIncrement: true } }, sets: { orderBy: { setNumber: 'asc' } } },
    }),
    prisma.setLog.aggregate({ where: { userId, exerciseId, isCompleted: true }, _max: { estimated1RM: true } }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: 3,
      include: { sets: { where: { isCompleted: true }, orderBy: { setNumber: 'asc' } } },
    }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId, notes: { not: null }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: 5,
      select: { performedAt: true, notes: true },
    }),
  ]);
  return { last, agg, recent, notes };
}

// JALUR BARU: 3 query tetap untuk SEMUA gerakan (replika getWorkoutInitialDataAction
// yang sudah diperbaiki). Inilah yang diukur — bukan lagi cara lama 4 query/gerakan
// yang terbukti gagal di ~5030 ms.
async function riwayatGabungan(userId, ids) {
  const MAX_PRELOAD = 24;
  const [recentRows, bestRows, noteRows] = await Promise.all([
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId: { in: ids }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 4,
      select: {
        exerciseId: true,
        performedAt: true,
        sets: { orderBy: { setNumber: 'asc' }, select: { setNumber: true, weight: true, reps: true, setType: true, isCompleted: true } },
      },
    }),
    prisma.setLog.groupBy({ by: ['exerciseId'], where: { userId, exerciseId: { in: ids }, isCompleted: true }, _max: { estimated1RM: true } }),
    prisma.sessionExercise.findMany({
      where: { userId, exerciseId: { in: ids }, notes: { not: null }, workoutSession: { isCompleted: true } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 5,
      select: { exerciseId: true, performedAt: true, notes: true },
    }),
  ]);
  return { recentRows, bestRows, noteRows };
}

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true, email: true } });
  console.log('user uji:', user ? user.id : '(tidak ada)');
  if (!user) throw new Error('tidak ada user');

  // cari program dengan 5-10 gerakan (kasus user)
  const progs = await prisma.program.findMany({
    where: { userId: user.id },
    include: { _count: { select: { exercises: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  console.log('\nprogram milik user:');
  for (const p of progs) {
    console.log('  ' + p.id + '  ' + String(p._count.exercises).padStart(2) + ' gerakan  archived=' + p.isArchived + '  ' + p.name);
  }

  const target = progs.find((p) => p._count.exercises >= 5 && p._count.exercises <= 10) || progs[0];
  if (!target) {
    console.log('\n(tidak ada program — user belum membuat program)');
    await prisma.$disconnect();
    return;
  }
  console.log('\n=== mengukur program: ' + target.name + ' (' + target._count.exercises + ' gerakan) ===');

  const t0 = Date.now();

  // Q1+Q2: sama seperti action (paralel)
  let userPrograms, availableExercises;
  try {
    [userPrograms, availableExercises] = await Promise.all([
      prisma.program.findMany({
        where: { userId: user.id, isArchived: false },
        orderBy: { sortOrder: 'asc' },
        include: { exercises: { orderBy: { sortOrder: 'asc' }, include: { exercise: true } } },
      }),
      prisma.exercise.findMany({
        where: { isArchived: false, OR: [{ userId: null }, { userId: user.id }] },
        orderBy: [{ primaryMuscle: 'asc' }, { name: 'asc' }],
      }),
    ]);
  } catch (e) {
    console.log('GAGAL di Q1/Q2 setelah ' + (Date.now() - t0) + ' ms: ' + e.code + ' ' + String(e.message).slice(0, 200));
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log('Q1+Q2 (program + pustaka) : ' + (Date.now() - t0) + ' ms  -> ' + userPrograms.length + ' program aktif, ' + availableExercises.length + ' gerakan');

  const selected = userPrograms.find((p) => p.id === target.id) || null;
  console.log('selectedProgram ketemu    : ' + (selected ? 'YA (' + selected.exercises.length + ' gerakan)' : 'TIDAK — initialProgram jadi null!'));

  if (selected) {
    // cek pe.exercise ada (kalau null, createExercisesFromProgram THROW)
    const tanpaExercise = selected.exercises.filter((pe) => !pe.exercise);
    console.log('pe.exercise kosong        : ' + tanpaExercise.length + (tanpaExercise.length ? '  <-- createExercisesFromProgram akan THROW' : ''));
    // cek targetSets
    const tanpaSets = selected.exercises.filter((pe) => !pe.targetSets);
    console.log('pe.targetSets kosong      : ' + tanpaSets.length + ' (default dipakai: 3)');
  }

  // Q3: riwayat — pakai JALUR BARU (3 query tetap untuk semua gerakan)
  const ids = Array.from(new Set((selected?.exercises || []).map((pe) => pe.exerciseId)));
  const tH = Date.now();
  try {
    const { recentRows, bestRows, noteRows } = await riwayatGabungan(user.id, ids);
    console.log('riwayat (3 query gabungan) : ' + (Date.now() - tH) + ' ms  -> ' + recentRows.length + ' baris sesi, ' + bestRows.length + ' best1RM, ' + noteRows.length + ' catatan');
  } catch (e) {
    console.log('GAGAL di riwayat setelah ' + (Date.now() - tH) + ' ms: ' + (e.code || '') + ' ' + String(e.message).slice(0, 200));
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log('TOTAL action              : ' + (Date.now() - t0) + ' ms');
  console.log('\n=> action SELESAI tanpa error (halaman TIDAK jatuh ke mode offline)');

  await prisma.$disconnect();
})().catch((e) => {
  console.error('\nFATAL:', e.code || '', String(e.message).slice(0, 300));
  process.exit(1);
});
