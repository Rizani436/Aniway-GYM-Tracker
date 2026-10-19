// Terapkan supabase/storage-policies.sql ke database.
// Idempoten (drop if exists + create). Cetak verifikasi setelah selesai.
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sql = fs.readFileSync('supabase/storage-policies.sql', 'utf8');

// Pisahkan per statement: buang baris komentar, pecah pada ';'
const statements = sql
  .split('\n')
  .filter((l) => !l.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

(async () => {
  console.log('statement akan dijalankan:', statements.length);
  try {
    for (const [i, st] of statements.entries()) {
      const label = st.slice(0, 62).replace(/\s+/g, ' ');
      await prisma.$executeRawUnsafe(st);
      console.log(`  [${i + 1}/${statements.length}] OK  ${label}…`);
    }

    // Verifikasi
    const policies = await prisma.$queryRawUnsafe(`
      SELECT policyname, cmd, roles::text AS roles
      FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
      ORDER BY cmd, policyname
    `);
    console.log('\n=== POLICY TERPASANG:', policies.length, '===');
    policies.forEach((p) => console.log(`  [${p.cmd.padEnd(6)}] ${p.policyname} | roles=${p.roles}`));

    const cek = await prisma.$queryRawUnsafe(`
      SELECT cmd, count(*)::int AS n FROM pg_policies
      WHERE schemaname='storage' AND tablename='objects' AND policyname LIKE 'exercise-images%'
      GROUP BY cmd
    `);
    console.log('ringkas:', JSON.stringify(cek));

    await prisma.$disconnect();
    process.exit(policies.length >= 4 ? 0 : 1);
  } catch (e) {
    console.log('GAGAL:', String(e.message).slice(0, 300));
    await prisma.$disconnect();
    process.exit(1);
  }
})();
