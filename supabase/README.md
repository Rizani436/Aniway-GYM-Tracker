# Setup Supabase Storage

## Bucket `exercise-images` (foto gerakan)

Bucket ini menyimpan foto gerakan yang diunggah user. Konfigurasi wajib:

| Setelan | Nilai |
|---|---|
| Public | **ON** — foto dibaca lewat `/storage/v1/object/public/exercise-images/...` |
| Batas ukuran | 2 MB (juga divalidasi di klien, lihat `src/lib/storage.ts`) |
| MIME diizinkan | `image/jpeg`, `image/png`, `image/webp` |

## Policy RLS — WAJIB

RLS **aktif** di `storage.objects`. Tanpa policy, *semua* akses ditolak dan upload
dari browser gagal dengan:

```
Gagal upload gambar: new row violates row-level security policy
```

Bucket `public = true` **hanya** berarti foto boleh dibaca; menulis tetap butuh policy.

Terapkan policy (idempoten, aman dijalankan berulang):

```bash
node scripts/apply-storage-policies.cjs
```

Isi policy ada di [`storage-policies.sql`](./storage-policies.sql):

| Policy | Perintah | Role | Aturan |
|---|---|---|---|
| `exercise-images: baca publik` | SELECT | public | semua objek di bucket ini |
| `exercise-images: upload milik sendiri` | INSERT | authenticated | folder pertama = `auth.uid()` |
| `exercise-images: ubah milik sendiri` | UPDATE | authenticated | folder pertama = `auth.uid()` |
| `exercise-images: hapus milik sendiri` | DELETE | authenticated | folder pertama = `auth.uid()` |

Aturan "folder pertama = `auth.uid()`" cocok dengan pola path di
`src/lib/storage.ts`: `<userId>/<timestamp>.<ext>` — sehingga user tidak bisa
menulis ke folder milik user lain.

## Verifikasi

```bash
node scripts/test-storage-policy.cjs   # simulasi user login: upload sendiri OK, folder orang lain/anon ditolak
node scripts/test-upload-e2e.cjs       # jalur anon (tanpa login) harus DITOLAK
node scripts/diag-storage-policy.cjs   # tampilkan kondisi bucket + policy saat ini
```
