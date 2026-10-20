// Mengukur jalur /workout dengan bentuk query BARU (slim select + jendela waktu
// riwayat) supaya perbaikan bisa dibuktikan, bukan diklaim.
// Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAX_PRELOAD = 24;
const HISTORY_WINDOW_DAYS = 120;

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  const t0 = Date.now();

  // Q1 + Q2 (bentuk baru: select ramping)
  const [userPrograms, availableExercises] = await Promise.all([
    prisma.program.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: { sortOrder: 'asc' },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          select: {
            exerciseId: true, targetSets: true, targetRepMin: true, targetRepMax: true,
            restSeconds: true, notes: true,
            exercise: { select: { name: true, primaryMuscle: true, equipment: true, weightIncrement: true, imageUrl: true } },
          },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { isArchived: false, OR: [{ userId: null }, { userId: user.id }] },
      orderBy: [{ primaryMuscle: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, primaryMuscle: true, equipment: true, weightIncrement: true, imageUrl: true },
    }),
  ]);
  const tQ12 = Date.now() - t0;
  const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(1);

  console.log('Q1 program (slim) : ' + tQ12 + ' ms -> ' + userPrograms.length + ' program, ' + kb(userPrograms) + ' KB');
  console.log('Q2 pustaka (slim) : ' + availableExercises.length + ' gerakan, ' + kb(availableExercises) + ' KB');
  console.log('   (bentuk LAMA: 200 KB / 7848 ms untuk pustaka yang sama)');

  const progs = await prisma.program.findMany({
    where: { userId: user.id, isArchived: false },
    include: { exercises: { select: { exerciseId: true, targetRepMax: true } } },
  });
  const prog = progs.find((p) => p.exercises.length >= 5) || progs[0];

  // Validasi bentuk baru: periksa objek dari Q1 SLIM di atas (bukan query lain).
  // (Versi pertama skrip ini salah memeriksa hasil query terpisah yang memang
  // hanya mengambil 2 kolom, sehingga melaporkan field "hilang" palsu.)
  const pe = userPrograms[0]?.exercises?.[0];
  if (!pe) {
    console.log('\n(tidak ada ProgramExercise untuk divalidasi)');
  } else {
    const wajib = ['exerciseId', 'targetSets', 'targetRepMin', 'targetRepMax', 'restSeconds', 'notes', 'exercise'];
    const hilang = wajib.filter((k) => !(k in pe));
    const lewat = Object.keys(pe); // field yang TIDAK dipakai runner ikut terkirim?
    const exWajib = ['name', 'primaryMuscle', 'equipment', 'weightIncrement', 'imageUrl'];
    const exHilang = exWajib.filter((k) => !(k in (pe.exercise || {})));
    const exBerlebih = Object.keys(pe.exercise || {}).filter((k) => !exWajib.includes(k));

    console.log('\nfield ProgramExercise terkirim: ' + lewat.join(', '));
    console.log('  -> wajib hilang   : ' + (hilang.length ? hilang.join(', ') + '  [MASALAH]' : 'tidak ada ✓'));
    console.log('field exercise terkirim       : ' + Object.keys(pe.exercise || {}).join(', '));
    console.log('  -> wajib hilang   : ' + (exHilang.length ? exHilang.join(', ') + '  [MASALAH]' : 'tidak ada ✓'));
    console.log('  -> berlebih (boros): ' + (exBerlebih.length ? exBerlebih.join(', ') : 'tidak ada ✓'));
  }

  // Q3 riwayat (bentuk baru: 3 query + jendela waktu)
  const ids = Array.from(new Set(prog.exercises.map((p) => p.exerciseId))).slice(0, MAX_PRELOAD);
  const windowStart = new Date(Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const t1 = Date.now();
  const [recentRows, bestRows, noteRows] = await Promise.all([
    prisma.sessionExercise.findMany({
      where: { userId: user.id, exerciseId: { in: ids }, workoutSession: { isCompleted: true }, performedAt: { gte: windowStart } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 4,
      select: { exerciseId: true, performedAt: true, sets: { orderBy: { setNumber: 'asc' }, select: { setNumber: true, weight: true, reps: true, setType: true, isCompleted: true } } },
    }),
    prisma.setLog.groupBy({ by: ['exerciseId'], where: { userId: user.id, exerciseId: { in: ids }, isCompleted: true }, _max: { estimated1RM: true } }),
    prisma.sessionExercise.findMany({
      where: { userId: user.id, exerciseId: { in: ids }, notes: { not: null }, workoutSession: { isCompleted: true }, performedAt: { gte: windowStart } },
      orderBy: { performedAt: 'desc' },
      take: MAX_PRELOAD * 5,
      select: { exerciseId: true, performedAt: true, notes: true },
    }),
  ]);
  console.log('\nQ3 riwayat (3 query + jendela ' + HISTORY_WINDOW_DAYS + 'hr): ' + (Date.now() - t1) + ' ms -> ' + recentRows.length + ' baris, ' + bestRows.length + ' best1RM, ' + noteRows.length + ' catatan');

  console.log('\nTOTAL jalur baru: ' + (Date.now() - t0) + ' ms');
  console.log('(sebelum perbaikan gelombang 1: ~8600-9400 ms, dan bagian riwayat pernah GAGAL 5/5)');

  await prisma.$disconnect();
})().catch((e) => { console.error('FATAL:', e.code || '', String(e.message).split('\n')[0].slice(0, 200)); process.exit(1); });
