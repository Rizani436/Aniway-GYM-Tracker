// Menyelidiki deteksi PR: apakah 18 dari 59 set wajar, atau ada kelebihan tanda?
// Membaca ulang logika produksi (saveWorkoutSessionAction) dan membandingkan
// dengan apa yang benar-benar tersimpan di DB. Hanya BACA.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });

  const sesi = await prisma.workoutSession.findMany({
    where: { userId: user.id, isCompleted: true },
    orderBy: { startedAt: 'asc' },
    select: { id: true, name: true, startedAt: true },
  });
  console.log('sesi selesai:', sesi.length);

  for (const s of sesi) {
    const sets = await prisma.setLog.findMany({
      where: { userId: user.id, sessionExercise: { workoutSessionId: s.id } },
      orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
      select: {
        exerciseId: true, setNumber: true, weight: true, reps: true,
        setType: true, estimated1RM: true, isCompleted: true, isPersonalRecord: true,
        exercise: { select: { name: true } },
      },
    });
    const pr = sets.filter((x) => x.isPersonalRecord);
    console.log('\n=== ' + s.name + ' (' + s.startedAt.toISOString().slice(0, 10) + ') ===');
    console.log('   set:', sets.length, '| ditandai PR:', pr.length);

    // Kelompokkan per gerakan, periksa apakah pola penandaan masuk akal
    const perGerakan = {};
    for (const x of sets) (perGerakan[x.exerciseId] ||= { nama: x.exercise.name, sets: [] }).sets.push(x);

    for (const [exId, g] of Object.entries(perGerakan)) {
      const prSets = g.sets.filter((x) => x.isPersonalRecord);
      if (prSets.length <= 1) continue; // wajar: satu set terbaik
      console.log('   PERHATIAN: ' + g.nama + ' punya ' + prSets.length + ' set ber-PR dalam satu sesi:');
      for (const x of g.sets) {
        console.log('     set ' + x.setNumber + ': ' + x.weight + 'kg x ' + x.reps +
          ' = 1RM ' + x.estimated1RM + (x.isPersonalRecord ? '  [PR]' : ''));
      }
    }
  }

  // Ringkasan: berapa set PR per gerakan
  const semua = await prisma.setLog.findMany({
    where: { userId: user.id, isCompleted: true },
    select: { exerciseId: true, isPersonalRecord: true, exercise: { select: { name: true } } },
  });
  const agg = {};
  for (const x of semua) {
    (agg[x.exerciseId] ||= { nama: x.exercise.name, total: 0, pr: 0 });
    agg[x.exerciseId].total++;
    if (x.isPersonalRecord) agg[x.exerciseId].pr++;
  }
  console.log('\n=== ringkasan per gerakan (set PR / total set) ===');
  const urut = Object.values(agg).sort((a, b) => b.pr - a.pr);
  for (const g of urut) console.log('  ' + String(g.pr) + '/' + String(g.total) + '  ' + g.nama);
  const totalPr = semua.filter((x) => x.isPersonalRecord).length;
  console.log('\ntotal set PR:', totalPr, 'dari', semua.length, 'set (' + Math.round((totalPr / semua.length) * 100) + '%)');

  await prisma.$disconnect();
})().catch((e) => { console.error('FATAL:', e.code || e.message); process.exit(1); });
