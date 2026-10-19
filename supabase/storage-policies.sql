-- Policy Storage untuk bucket 'exercise-images' (foto gerakan).
--
-- Kenapa perlu: RLS AKTIF di storage.objects, dan tanpa policy apa pun SEMUA akses
-- ditolak. Akibatnya upload dari browser gagal dengan:
--   "new row violates row-level security policy"
-- Bucket sendiri sudah `public = true` (baca lewat /object/public/ jalan), tapi
-- PUBLIC TIDAK MENULIS — itu sebabnya policy INSERT di bawah wajib.
--
-- Aturan path objek (lihat src/lib/storage.ts):
--   <userId>/<timestamp>.<ext>
-- sehingga folder pertama HARUS sama dengan auth.uid() milik pengunggah.
--
-- Idempoten: aman dijalankan berulang (drop ... if exists lalu create).

-- 1) Baca publik — agar foto bisa tampil ke siapa pun lewat API maupun CDN.
drop policy if exists "exercise-images: baca publik" on storage.objects;
create policy "exercise-images: baca publik"
  on storage.objects for select
  using (bucket_id = 'exercise-images');

-- 2) Upload hanya ke folder milik sendiri.
drop policy if exists "exercise-images: upload milik sendiri" on storage.objects;
create policy "exercise-images: upload milik sendiri"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) Ganti isi hanya milik sendiri (mis. fitur ganti foto di masa depan).
drop policy if exists "exercise-images: ubah milik sendiri" on storage.objects;
create policy "exercise-images: ubah milik sendiri"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Hapus hanya milik sendiri (cadangan fitur hapus foto).
drop policy if exists "exercise-images: hapus milik sendiri" on storage.objects;
create policy "exercise-images: hapus milik sendiri"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'exercise-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
