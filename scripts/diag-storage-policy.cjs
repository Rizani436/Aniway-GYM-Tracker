// Diagnostik policy Storage Supabase (READ-ONLY).
// Menjawab: apakah bucket 'exercise-images' publik, dan policy apa saja yang ada
// di storage.objects? Upload gagal karena "row-level security policy" = tidak ada
// policy INSERT untuk role authenticated.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      // 1. Konfigurasi bucket
      const buckets = await prisma.$queryRawUnsafe(`
        SELECT id, name, public, file_size_limit, allowed_mime_types
        FROM storage.buckets WHERE id = 'exercise-images'
      `);
      console.log('=== BUCKET ===');
      if (!buckets.length) console.log('  TIDAK ADA BUCKET exercise-images!');
      buckets.forEach((b) =>
        console.log(
          `  id=${b.id} | public=${b.public} | maxBytes=${b.file_size_limit ?? 'unset'} | mime=${b.allowed_mime_types ? b.allowed_mime_types.join(',') : 'unset'}`
        )
      );

      // 2. Policy yang ada di storage.objects
      const policies = await prisma.$queryRawUnsafe(`
        SELECT policyname, cmd, roles::text AS roles, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
        ORDER BY policyname
      `);
      console.log('\n=== POLICY storage.objects ===', policies.length, 'buah');
      policies.forEach((p) =>
        console.log(`  [${p.cmd}] ${p.policyname} | roles=${p.roles}\n      using: ${p.qual || '-'}\n      check: ${p.with_check || '-'}`)
      );

      // 3. Status RLS tabel
      const rls = await prisma.$queryRawUnsafe(`
        SELECT relname, relrowsecurity FROM pg_class
        WHERE relname = 'objects' AND relnamespace = 'storage'::regnamespace
      `);
      console.log('\n=== RLS aktif di storage.objects ===', JSON.stringify(rls));

      // 4. Role yang kita pakai (apakah boleh bikin policy)
      const who = await prisma.$queryRawUnsafe(`SELECT current_user, session_user`);
      console.log('=== koneksi sebagai ===', JSON.stringify(who));

      const boleh = await prisma.$queryRawUnsafe(`
        SELECT has_table_privilege(current_user, 'storage.objects', 'SELECT') AS bisa_select,
               pg_has_role(current_user, 'supabase_storage_admin', 'MEMBER') AS anggota_storage_admin
      `);
      console.log('=== hak akses ===', JSON.stringify(boleh));

      await prisma.$disconnect();
      process.exit(0);
    } catch (e) {
      console.log('percobaan', attempt, 'gagal:', String(e.message).split('\n')[0].slice(0, 90));
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  process.exit(1);
})();
