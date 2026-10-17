// Diagnostik: ukur latensi DB + apakah transaction 19 query melewati batas 5s Prisma.
// READ-ONLY: hanya SELECT 1. Tidak menulis apa pun.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // 1. Latensi query tunggal (5 sampel)
  const lat = [];
  for (let i = 0; i < 5; i++) {
    const t = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    lat.push(Date.now() - t);
  }
  console.log('latensi SELECT 1 (ms):', lat.join(', '));
  const avg = lat.reduce((a, b) => a + b, 0) / lat.length;
  console.log('rata-rata:', avg.toFixed(0), 'ms  → estimasi 19 query:', (avg * 19 / 1000).toFixed(2), 's');

  // 2. Simulasi transaction 19 query (persis jumlah query untuk sesi 9 gerakan)
  const t0 = Date.now();
  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < 19; i++) await tx.$queryRaw`SELECT 1`;
    });
    console.log('transaction 19 query: SUKSES dalam', Date.now() - t0, 'ms');
  } catch (e) {
    console.log('transaction 19 query: GAGAL setelah', Date.now() - t0, 'ms');
    console.log('  kode:', e.code, '| pesan:', String(e.message).slice(0, 200));
  }

  // 3. Cek apakah klien benar-benar pooled (pgbouncer) + batas transaksi
  const [{ version }] = await prisma.$queryRaw`SELECT version()`;
  console.log('server:', String(version).slice(0, 60));
  console.log('pooler?', /pgbouncer/i.test(String(version)) ? 'YA' : 'tidak terdeteksi');

  await prisma.$disconnect();
})().catch((e) => {
  console.error('FATAL:', e.code || '', String(e.message).slice(0, 300));
  process.exit(1);
});
