# 1. Base stage
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
# CATATAN: schema prisma TIDAK di-copy di stage ini. Dulu ada `COPY prisma ./prisma/`
# di sini, sehingga tiap perubahan schema mem-bust cache layer `npm ci` dan semua
# dependency di-download ulang (di VPS dengan koneksi lambat ke registry.npmjs.org
# ini berarti build 8 menit lalu gagal EIDLETIMEOUT). Schema masuk lewat
# `COPY . .` di builder, sebelum `npx prisma generate`.
RUN npm config set fetch-timeout 600000 && npm ci

# 3. Builder stage
FROM base AS builder

# PENTING: variabel NEXT_PUBLIC_* di-INLINE oleh Next.js saat BUILD, bukan dibaca saat runtime.
# Karena .dockerignore mengecualikan .env (agar kredensial tidak masuk image), nilai-nilai ini
# HARUS diberikan lewat build arg. Tanpa ini, bundle berisi nilai kosong dan setiap Server
# Component yang memanggil createClient() gagal dengan "An error occurred in the Server
# Components render" hanya di produksi.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Gagalkan build lebih awal dengan pesan jelas, daripada menghasilkan image yang
# error-nya baru terlihat sebagai digest di browser.
RUN node -e "\
  const missing = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY']\
    .filter((k) => !process.env[k] || process.env[k].length < 8);\
  if (missing.length) {\
    console.error('\n[BUILD GAGAL] Build arg berikut kosong: ' + missing.join(', '));\
    console.error('Jalankan: docker compose build, atau');\
    console.error('docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... .\n');\
    process.exit(1);\
  }\
"

RUN npm run build

# Gagalkan build bila aset `public/` tidak ikut masuk context.
#
# KENAPA: kalau folder public/ tidak ada (mis. build dijalankan dari salinan repo
# yang belum lengkap), Next.js TIDAK error — ia hanya membalas 400 Bad Request
# untuk setiap berkas publik (.png/.json/.js) dan 404 untuk .ico. Akibatnya
# /manifest.json, /sw.js, dan ikon PWA mati di produksi tanpa jejak di log build.
RUN node -e "\
  const fs = require('fs');\
  const wajib = ['manifest.json','sw.js','icon-192.png','icon-512.png'];\
  const hilang = wajib.filter((f) => !fs.existsSync('public/' + f));\
  if (hilang.length) {\
    console.error('\n[BUILD GAGAL] Folder public/ tidak lengkap. Berkas hilang: ' + hilang.join(', '));\
    console.error('Penyebab umum: build dijalankan dari salinan repo yang belum lengkap.');\
    console.error('Jalankan: git pull && git status --short, pastikan folder public/ ada, lalu build ulang.\n');\
    process.exit(1);\
  }\
  console.log('[OK] aset public/ lengkap: ' + wajib.join(', '));\
"

# 4. Production Runner stage
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets & standalone bundle
COPY --from=builder --chown=nextjs:nogroup /app/public ./public
RUN find public -type d -exec chmod 755 {} + && find public -type f -exec chmod 644 {} +
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma CLI + schema ikut ke runner: dari host, `docker compose exec aniway-app npx prisma db push`
# jalan offline (runner standalone tidak bawa prisma CLI, user nextjs tak punya home untuk cache npm).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
