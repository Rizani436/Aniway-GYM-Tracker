// Verifikasi query prCount yang baru: jumlah GERAKAN ber-PR (bukan jumlah set).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  const t = Date.now();
  const rows = await prisma.setLog.groupBy({
    by: ['exerciseId'],
    where: { userId: user.id, isPersonalRecord: true, isCompleted: true },
  });
  const totalSetPR = await prisma.setLog.count({ where: { userId: user.id, isPersonalRecord: true, isCompleted: true } });
  console.log('set PR total      :', totalSetPR);
  console.log('gerakan ber-PR    :', rows.length, '  <- ini yang ditampilkan di Home');
  console.log('waktu query       :', Date.now() - t, 'ms');
  console.log(rows.length > 0 ? '=> pintasan PR AKAN TAMPIL di Home ✓' : '=> pintasan tersembunyi (belum ada PR)');
  await prisma.$disconnect();
})().catch(e => { console.error('FATAL:', e.code || e.message); process.exit(1); });
