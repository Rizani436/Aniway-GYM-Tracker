// Uji logika Target 1RM: groupBy best-1RM per gerakan + perhitungan persen.
// Data nyata (baca-saja), lalu 3 skenario buatan untuk badge UI.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });

  // Replika query getProgramByIdAction untuk semua program user
  const programs = await prisma.program.findMany({
    where: { userId: user.id, isArchived: false },
    include: { exercises: { include: { exercise: { select: { id: true, name: true } } } } },
  });

  for (const program of programs) {
    const ids = program.exercises.map((pe) => pe.exerciseId);
    if (ids.length === 0) continue;
    const rows = await prisma.setLog.groupBy({
      by: ['exerciseId'],
      where: {
        userId: user.id,
        exerciseId: { in: ids },
        isCompleted: true,
        setType: { in: ['NORMAL', 'DROPSET'] },
      },
      _max: { estimated1RM: true },
    });
    const best = {};
    for (const r of rows) best[r.exerciseId] = r._max.estimated1RM;

    console.log('\n' + program.name + ' (' + program.exercises.length + ' gerakan):');
    for (const pe of program.exercises) {
      const b = best[pe.exerciseId];
      const nama = pe.exercise.name.slice(0, 28);
      if (pe.target1RM == null) {
        console.log('  ' + nama.padEnd(30) + ' best=' + (b ? b.toFixed(1) : '-') + '  tanpa target');
      } else {
        const persen = b ? Math.round((b / pe.target1RM) * 100) : null;
        const badge = persen == null ? 'BELUM ADA SET' : persen >= 100 ? 'TERCAPAI' : persen + '%';
        console.log('  ' + nama.padEnd(30) + ' best=' + (b ? b.toFixed(1) : '-') +
          '  target=' + pe.target1RM.toFixed(1) + '  ' + badge);
      }
    }
  }

  // Skenario badge
  const badge = (best, target) => {
    if (target == null) return 'tanpa badge';
    if (best == null) return 'Target saja (abu)';
    return best / target >= 1 ? 'TERCAPAI (hijau)' : Math.round((best / target) * 100) + '% (kuning)';
  };
  console.log('\nuji badge:');
  const cek = [
    ['tanpa target', badge(80, null), 'tanpa badge'],
    ['target tanpa PR', badge(null, 90), 'Target saja (abu)'],
    ['PR 81 target 90', badge(81, 90), '90% (kuning)'],
    ['PR 95 target 90', badge(95, 90), 'TERCAPAI (hijau)'],
  ];
  let ok = true;
  for (const [label, hasil, harap] of cek) {
    const lulus = hasil === harap;
    if (!lulus) ok = false;
    console.log('  ' + (lulus ? 'OK  ' : 'FAIL') + ' ' + label.padEnd(18) + ' => ' + hasil);
  }
  console.log(ok ? '\n=> LOGIKA TARGET BENAR' : '\n=> ADA YANG SALAH');
  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.code || e.message); process.exit(1); });
