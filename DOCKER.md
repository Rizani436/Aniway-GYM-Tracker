# Panduan Deploy Docker - Aniway Gym Tracker

Aplikasi menggunakan multi-stage build Alpine Linux dengan fitur `standalone` Next.js sehingga ukuran image sangat ringan (~150MB-200MB) dan cepat.

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

Aplikasi langsung dapat diakses di: `http://localhost:3000` (atau IP VPS Anda di port 3000).

---

## 2. Menjalankan Manual dengan Docker CLI

```bash
# 1. Build Docker image
docker build -t aniway-gym-tracker .

# 2. Jalankan container dengan file .env
docker run -d \
  --name aniway_app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  aniway-gym-tracker
```

---

## 3. Deploy ke VPS / Cloud (Coolify, Portainer, CapRover, VPS Ubuntu)

1. Clone / copy folder project ke VPS Anda.
2. Siapkan file `.env` di VPS:
   ```env
   DATABASE_URL="postgresql://postgres.[ID]:[PASS]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[ID]:[PASS]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
   ```
3. Jalankan:
   ```bash
   docker compose up -d --build
   ```
4. Pasang reverse proxy Nginx / Caddy / Cloudflare Tunnel untuk mengarahkan domain (misal: `gym.domainanda.com`) dengan SSL HTTPS ke port `3000`.
