// Cari kombinasi port + parameter tercepat untuk Supavisor Supabase.
import { PrismaClient } from '@prisma/client';

const base = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function bench(label, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } }, log: [] });
  const times = [];
  for (let i = 0; i < 8; i++) {
    const t = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      times.push(Date.now() - t);
    } catch (e) {
      times.push('ERR:' + e.message.split('\n')[0].slice(0, 40));
    }
  }
  await prisma.$disconnect().catch(() => {});
  const nums = times.filter((x) => typeof x === 'number');
  const warm = nums.slice(1);
  const avg = warm.length ? Math.round(warm.reduce((a, b) => a + b, 0) / warm.length) : '-';
  console.log(`${label.padEnd(42)} avg(hangat) ${String(avg).padStart(5)} ms   ${times.join(', ')}`);
}

function build({ port, pgbouncer, connectionLimit, poolTimeout }) {
  const u = new URL(base);
  if (port) u.port = String(port);
  if (pgbouncer === false) u.searchParams.delete('pgbouncer');
  if (pgbouncer === true) u.searchParams.set('pgbouncer', 'true');
  if (connectionLimit) u.searchParams.set('connection_limit', String(connectionLimit));
  if (poolTimeout) u.searchParams.set('pool_timeout', String(poolTimeout));
  return u.toString();
}

console.log('=== Variasi port & pgbouncer ===');
await bench('5432, tanpa pgbouncer', build({ port: 5432, pgbouncer: false }));
await bench('5432, pgbouncer=true', build({ port: 5432, pgbouncer: true }));
await bench('6543, tanpa pgbouncer', build({ port: 6543, pgbouncer: false }));
await bench('6543, pgbouncer=true', build({ port: 6543, pgbouncer: true }));

console.log('\n=== Tambahan connection_limit pada konfigurasi terbaik ===');
await bench('5432, tanpa pgbouncer, limit=1', build({ port: 5432, pgbouncer: false, connectionLimit: 1 }));
await bench('5432, tanpa pgbouncer, limit=5', build({ port: 5432, pgbouncer: false, connectionLimit: 5 }));
await bench('5432, tanpa pgbouncer, limit=10', build({ port: 5432, pgbouncer: false, connectionLimit: 10 }));
