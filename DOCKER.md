# Panduan Deploy Docker - Aniway Gym Tracker

Aplikasi menggunakan multi-stage build Alpine Linux dengan fitur `standalone` Next.js sehingga ukuran image sangat ringan (~150MB-200MB) dan cepat.

---

## PENTING: Variabel `NEXT_PUBLIC_*` harus ada saat BUILD

Next.js **meng-inline** nilai `NEXT_PUBLIC_*` ke dalam bundle JavaScript pada saat `next build`,
bukan saat container dijalankan. Karena `.dockerignore` mengecualikan `.env` (agar kredensial tidak
masuk ke dalam image), nilai-nilai itu harus diberikan lewat **build arg**.

Kalau terlewat, bundle akan berisi nilai kosong secara permanen dan setiap halaman yang memuat data
gagal dengan pesan di browser:

```
An error occurred in the Server Components render. The specific message is omitted
in production builds to avoid leaking sensitive details. A digest property is
included on this error instance which may provide additional details...
```

Mengubah `.env` lalu `docker compose restart` **tidak memperbaikinya** — build ulang image-nya
(`docker compose up -d --build`) karena nilainya sudah dipanggang ke dalam bundle.

Dockerfile sudah dilengkapi pemeriksaan otomatis yang menghentikan build dengan pesan jelas bila
variabel ini kosong, jadi kesalahan ini tidak akan lolos ke produksi secara diam-diam.

---

## 1. Menjalankan dengan Docker Compose (Direkomendasikan)

Pastikan file `.env` sudah terisi dengan kredensial Supabase Anda.

```bash
# Build dan jalankan container di background
docker compose up -d --build

# Cek status container
docker compose ps

# Cek logs aplikasi secara real-time
docker compose logs -f

# Mematikan container
docker compose down
```

`docker-compose.yml` sudah meneruskan `NEXT_PUBLIC_*` dari `.env` sebagai build arg secara otomatis.

Aplikasi langsung dapat diakses di: `http://localhost:3000` (atau IP VPS Anda di port 3000).

---

## 2. Menjalankan Manual dengan Docker CLI

Saat memakai `docker build` langsung, build arg harus disebutkan satu per satu:

```bash
# 1. Build image — NEXT_PUBLIC_* WAJIB disertakan di sini
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]" \
  --build-arg NEXT_PUBLIC_SITE_URL="https://gym.domainanda.com" \
  -t aniway-gym-tracker .

# 2. Jalankan container dengan file .env (untuk DATABASE_URL dkk yang dibaca saat runtime)
docker run -d \
  --name aniway_app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  aniway-gym-tracker
```

Atau ambil nilainya langsung dari `.env` supaya tidak perlu menyalin manual:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '\"')" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env | cut -d= -f2- | tr -d '\"')" \
  --build-arg NEXT_PUBLIC_SITE_URL="$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env | cut -d= -f2- | tr -d '\"')" \
  -t aniway-gym-tracker .
```

---

## 3. Deploy ke VPS / Cloud (Coolify, Portainer, CapRover, VPS Ubuntu)

1. Clone / copy folder project ke VPS Anda.
2. Siapkan file `.env` di VPS:
   ```env
   # WAJIB tanpa ?pgbouncer=true — parameter itu memperlambat setiap query ~5x
   # (1.5 detik menjadi 0.3 detik) pada Supavisor Supabase.
   DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
   ```
3. Jalankan:
   ```bash
   docker compose up -d --build
   ```
4. Pasang reverse proxy Nginx / Caddy / Cloudflare Tunnel untuk mengarahkan domain (misal: `gym.domainanda.com`) dengan SSL HTTPS ke port `3000`.

---

## GEJALA: berkas `public/` balas 400 Bad Request di produksi

**Ini bukan bug aplikasi.** Kalau `/manifest.json`, `/sw.js`, atau `/icon-192.png` membalas
**400 Bad Request** (dan `.ico` membalas 404) padahal di mesin lokal semuanya 200, artinya
**folder `public/` tidak ada di dalam build context** — biasanya karena build dijalankan dari
salinan repo yang belum lengkap (folder lama hasil copy/upload, bukan `git pull`).

Diagnosis cepat dari komputer Anda:

```bash
# 400 untuk .json/.js/.png + 404 untuk .ico  => public/ tidak ada di image
curl -s -o /dev/null -w "%{http_code}\n" https://domainanda.com/manifest.json
```

Perbaikan di VPS — build dari repo yang benar:

```bash
cd <folder yang benar-benar dipakai build>
git pull
ls public/            # WAJIB terlihat: manifest.json sw.js icon-*.png offline.html
docker compose up -d --build
docker compose logs -f | grep -i "aset public"
```

Build sekarang **gagal lebih awal dengan pesan jelas** bila `public/` tidak lengkap
(pemeriksaan di Dockerfile), jadi kesalahan ini tidak akan lolos diam-diam lagi.

**Catatan untuk platform PaaS (Coolify, CapRover, Railway, Vercel-like):** pastikan variabel
`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` diisi di tab
**Build Variables / Build-time Environment**, bukan hanya di Runtime Environment.
Variabel runtime saja tidak akan masuk ke bundle, dan halaman akan error dengan pesan
"An error occurred in the Server Components render".

---

## 4. Troubleshooting

### Muncul "An error occurred in the Server Components render"

Penyebab paling umum: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` kosong saat build.

Diagnosis cepat — cek apakah URL Supabase benar-benar tertanam di bundle yang disajikan.
Ganti `gym.domainanda.com` dan `[PROJECT-REF]` sesuai milik Anda:

```bash
curl -s https://gym.domainanda.com/login \
  | grep -oE '/_next/static/[a-zA-Z0-9/._-]+\.js' | sort -u \
  | while read c; do
      curl -s "https://gym.domainanda.com$c" | grep -q '[PROJECT-REF]' \
        && echo "OK: env tertanam di $c"
    done
```

Kalau tidak ada output "OK", env tidak tertanam — build ulang image dengan build arg yang benar.

### Halaman terasa lambat (query database ~1.5 detik)

Cek kesehatan koneksi database:

```bash
node --env-file=.env scripts/db-latency.mjs
```

Kalau hasilnya `Status: LAMBAT`, hapus `?pgbouncer=true` dari `DATABASE_URL`.
