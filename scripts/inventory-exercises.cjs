// Inventaris gerakan di DB: berapa, per otot, berapa yang punya gambar.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const all = await prisma.exercise.findMany({
    where: { userId: null },
    select: { name: true, primaryMuscle: true, equipment: true, imageUrl: true, isArchived: true },
    orderBy: [{ primaryMuscle: 'asc' }, { name: 'asc' }],
  });

  console.log('TOTAL gerakan master (userId=null):', all.length);
  console.log('punya imageUrl:', all.filter((e) => e.imageUrl).length);
  console.log('arsip:', all.filter((e) => e.isArchived).length);

  const perMuscle = {};
  for (const e of all) perMuscle[e.primaryMuscle] = (perMuscle[e.primaryMuscle] || 0) + 1;
  console.log('\nper otot:');
  for (const [m, n] of Object.entries(perMuscle).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + m.padEnd(12), n);
  }

  console.log('\nper alat:');
  const perEq = {};
  for (const e of all) perEq[e.equipment] = (perEq[e.equipment] || 0) + 1;
  for (const [q, n] of Object.entries(perEq).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + q.padEnd(14), n);
  }

  console.log('\nSEMUA NAMA (untuk cek duplikat):');
  all.forEach((e) => console.log('  -', e.name, e.imageUrl ? '' : '  [TANPA GAMBAR]'));

  await prisma.$disconnect();
})().catch((e) => {
  console.error('FATAL:', e.code || '', String(e.message).slice(0, 200));
  process.exit(1);
});
