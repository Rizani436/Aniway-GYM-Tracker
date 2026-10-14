// Diagnostik latency database Aniway.
// Jalankan: node --env-file=.env scripts/db-latency.mjs
//
// Cara membaca hasil:
//   < 400 ms  per query  = sehat
//   ~1500 ms  per query  = parameter pgbouncer=true masih terpasang di DATABASE_URL.
//                           Hapus parameter itu; lihat scripts/db-find-best.mjs.

import { PrismaClient } from '@prisma/client';

function mask(u) {
  try {
    const url = new URL(u);
    const params = Object.keys(Object.fromEntries(url.searchParams.entries()));
    return `${url.hostname}:${url.port}${url.pathname}${
      params.length ? '  params=' + params.join(',') : '  params=(tidak ada)'
    }`;
  } catch {
    return '(invalid)';
  }
}

console.log('DATABASE_URL :', mask(process.env.DATABASE_URL || ''));
console.log('DIRECT_URL   :', mask(process.env.DIRECT_URL || ''));

if ((process.env.DATABASE_URL || '').includes('pgbouncer=true')) {
  console.log('\n⚠  PERINGATAN: DATABASE_URL masih memakai pgbouncer=true.');
  console.log('   Parameter itu membuat setiap query ~5x lebih lambat pada Supavisor.\n');
}

const prisma = new PrismaClient({ log: [] });

console.log('--- 8x SELECT 1 (koneksi hangat) ---');
const times = [];
for (let i = 1; i <= 8; i++) {
  const t = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const ms = Date.now() - t;
  if (i > 1) times.push(ms);
  console.log(`  query #${i}  ${String(ms).padStart(5)} ms${i === 1 ? '   (warmup koneksi, wajar lambat)' : ''}`);
}

const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
console.log(`\nRata-rata setelah warmup: ${avg} ms`);
console.log(avg < 500 ? 'Status: SEHAT' : 'Status: LAMBAT — periksa parameter pgbouncer=true');

await prisma.$disconnect();
