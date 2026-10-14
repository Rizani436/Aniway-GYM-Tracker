# Aniway - Aplikasi Web Gym Tracker Indonesia

Paket ini berisi seluruh kode lengkap untuk **Tahap 1 (Setup, Skema Prisma, Supabase Auth, 40 Seed Gerakan Mesin)** dan **Tahap 2 (Master Latihan: CRUD Program, Pustaka Gerakan, Drag-and-Drop Urutan, Pengaturan Increment Beban per Alat)**.

## Cara Menjalankan di Komputer Anda

1. **Ekstrak file ZIP ini** ke sebuah folder, lalu buka terminal di dalam folder tersebut.
2. **Install seluruh dependencies:**
   ```bash
   npm install
   ```
3. **Siapkan file `.env`:**
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Lalu isi dengan kredensial proyek Supabase Anda (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, dan `DIRECT_URL`).
4. **Sinkronisasi Tabel Prisma ke Database Supabase:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Jalankan Seed Data (40 Gerakan Mesin Lengkap):**
   ```bash
   npm run db:seed
   ```
6. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
7. Buka **`http://localhost:3000`** di browser Anda.
