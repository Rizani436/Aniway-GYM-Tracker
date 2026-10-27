# Baseline migrations

## Kenapa baseline begini

Repo ini bertahun berjalan TANPA folder `prisma/migrations` — semua perubahan
skema diterapkan lewat `prisma db push` langsung dari mesin dev ke database
Supabase produksi (satu DB dipakai bersama dev & VPS). Folder `migrations`
dibuat belakangan (2026-10-26) dengan baseline dari schema saat ini.

## Isi

- `20261026090000_init/migration.sql` — snapshot penuh schema saat baseline:
  8 tabel (User, Program, Exercise, ProgramExercise [termasuk target1RM],
  WorkoutSession, SessionExercise, SetLog, BodyWeightLog).

## Aturan penting

1. Database produksi SUDAH identik dengan baseline (kolom sudah ada sebelum
   file ini dibuat), jadi baseline TIDAK boleh dijalankan sebagai `migrate
   deploy` biasa di DB yang sudah jalan — harus lewat resolve, lihat bawah.
2. Mulai sekarang: perubahan skema lewat `npx prisma migrate dev --name xxx`
   di dev (membuat file migration baru), BUKAN `db push`.
3. VPS: tidak perlu menjalankan migrate manual; DB satu-satunya adalah
   Supabase, di-update dari dev.

## Kalau suatu saat perlu `migrate` di DB produksi yang sudah jalan

DB sudah punya tabel-tabelnya, jadi langkah satu kali:

```bash
npx prisma migrate resolve --applied 20261026090000_init
```

Ini menandai baseline sebagai sudah diterapkan tanpa menjalankan SQL-nya.
Setelah itu `prisma migrate deploy` aman dipakai (mis. dari CI/VPS) karena
hanya menjalankan migration BARU setelah baseline.
