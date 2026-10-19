// Uji END-TO-END anti-duplikat memakai KODE PRODUKSI (saveWorkoutSessionAction),
// dengan HANYA lapisan auth yang diganti (action memakai cookies()/Supabase Auth
// yang butuh request scope Next — tidak tersedia di skrip Node).
//
// Yang diuji apa adanya: cek idempotensi + transaction + createManyAndReturn.
//
// Skenario = persis yang terjadi saat antrean offline retry:
//   1. kirim sesi (id = clientSessionId)  -> sesi terbentuk
//   2. kirim ULANG id sama (retry)        -> duplicate: true, TIDAK ada sesi baru
//   3. kirim ulang ke-3 kali              -> masih duplicate
//   4. buktikan di DB: 1 sesi, 3 set, volume tidak berlipat
//
// Jalankan: npx tsx scripts/test-idempotent-save.ts
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findFirst({ select: { id: true, email: true } });
  if (!user) throw new Error('tidak ada user di DB');

  // --- Ganti modul auth & revalidatePath dengan stub ---
  // Ini SATU-SATUNYA bagian yang tidak nyata: `cookies()` dan `revalidatePath`
  // butuh request scope Next, yang tidak ada di skrip Node. Cek idempotensi,
  // transaction, dan createManyAndReturn tetap kode produksi apa adanya.
  const Module = require('module');
  const origResolve = Module._resolveFilename;
  const stub = (realPath: string, exports: unknown) => {
    const abs = path.resolve(realPath);
    require.cache[abs] = {
      id: abs, filename: abs, loaded: true, exports,
      children: [], paths: [],
    } as unknown as NodeModule;
    return abs;
  };
  const authPath = stub('src/lib/supabase/server.ts', {
    createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: null }) } }),
    getAuthenticatedUser: async () => user,
  });
  const cachePath = stub('next/cache.ts', { revalidatePath: () => {} });
  const nextCacheResolved = require.resolve('next/cache');

  Module._resolveFilename = function (request: string, ...rest: unknown[]) {
    if (request === '@/lib/supabase/server') return authPath;
    if (request === 'next/cache') return cachePath;
    return origResolve.call(this, request, ...rest);
  };
  // next/cache asli juga di-stub supaya import internal Next memakai versi palsu
  require.cache[nextCacheResolved] = require.cache[cachePath];

  const mod = require(path.resolve('src/app/actions/workout-actions.ts'));
  const save = mod.saveWorkoutSessionAction;
  if (typeof save !== 'function') throw new Error('saveWorkoutSessionAction tidak ditemukan');

  const exs = await prisma.exercise.findMany({ take: 2, select: { id: true } });
  if (exs.length < 2) throw new Error('butuh 2 gerakan');

  const id = `off_test_${Date.now()}`;
  const payload = {
    id,
    programId: null,
    name: '__UJI_OFFLINE_SYNC__',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationSec: 600,
    notes: null,
    exercises: [
      {
        exerciseId: exs[0].id, sortOrder: 1, restSeconds: 90, notes: 'catatan uji',
        sets: [
          { setNumber: 1, weight: 60, reps: 10, setType: 'NORMAL', rpe: null, isCompleted: true },
          { setNumber: 2, weight: 60, reps: 10, setType: 'NORMAL', rpe: null, isCompleted: true },
        ],
      },
      {
        exerciseId: exs[1].id, sortOrder: 2, restSeconds: 90, notes: null,
        sets: [{ setNumber: 1, weight: 40, reps: 12, setType: 'NORMAL', rpe: null, isCompleted: true }],
      },
    ],
  };

  const bersih = () => prisma.workoutSession.deleteMany({ where: { name: '__UJI_OFFLINE_SYNC__' } });
  await bersih();

  const hasil: Array<{ i: number; sessionId?: string; duplicate: boolean; volume?: number; error?: string }> = [];
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await save(payload);
      hasil.push({ i, sessionId: r.sessionId, duplicate: r.duplicate ?? false, volume: r.totalVolume });
      console.log(`  kiriman ${i}: sessionId=${r.sessionId} duplicate=${r.duplicate ?? false} volume=${r.totalVolume}`);
    } catch (e) {
      hasil.push({ i, duplicate: false, error: String((e as Error).message).slice(0, 160) });
      console.log(`  kiriman ${i}: GAGAL -> ${String((e as Error).message).slice(0, 160)}`);
    }
  }

  const rows = await prisma.workoutSession.findMany({
    where: { name: '__UJI_OFFLINE_SYNC__' },
    include: { exercises: { include: { sets: true } } },
  });
  const jumlahSesi = rows.length;
  const jumlahSet = rows.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets.length, 0), 0);
  const volumeDB = rows[0]?.totalVolume ?? 0;
  const idDB = rows[0]?.id ?? '-';
  const catatanDB = rows[0]?.exercises?.[0]?.notes ?? null;

  console.log('\n--- hasil di DATABASE ---');
  console.log('jumlah sesi terbentuk     :', jumlahSesi, '(diharapkan 1)');
  console.log('jumlah set tersimpan      :', jumlahSet, '(diharapkan 3)');
  console.log('total volume              :', volumeDB, '(diharapkan 1680 = 60x10x2 + 40x12)');
  console.log('id sesi == clientSessionId:', idDB === id ? 'YA' : 'TIDAK (' + idDB + ')');
  console.log('catatan gerakan tersimpan :', catatanDB === 'catatan uji' ? 'YA' : 'TIDAK');

  await bersih();
  const sisa = await prisma.workoutSession.count({ where: { name: '__UJI_OFFLINE_SYNC__' } });
  console.log('data uji dibersihkan      :', sisa === 0 ? 'YA' : 'TIDAK');
  await prisma.$disconnect();

  const lulus =
    jumlahSesi === 1 &&
    jumlahSet === 3 &&
    volumeDB === 1680 &&
    idDB === id &&
    catatanDB === 'catatan uji' &&
    hasil[0]?.duplicate === false &&
    hasil[1]?.duplicate === true &&
    hasil[2]?.duplicate === true &&
    !hasil.some((h) => h.error) &&
    sisa === 0;

  console.log('\n--- penilaian ---');
  console.log('kiriman ke-1 membuat sesi       :', hasil[0]?.duplicate === false && !hasil[0]?.error ? 'YA' : 'TIDAK');
  console.log('kiriman ke-2 & ke-3 duplicate   :', hasil[1]?.duplicate && hasil[2]?.duplicate ? 'YA' : 'TIDAK');
  console.log('tidak ada sesi dobel            :', jumlahSesi === 1 ? 'YA' : 'TIDAK');
  console.log('volume tidak berlipat           :', volumeDB === 1680 ? 'YA' : 'TIDAK');
  console.log(lulus ? '=> ANTI-DUPLIKAT BEKERJA ✓' : '=> MASIH BERMASALAH ✗');
  process.exit(lulus ? 0 : 1);
})().catch((e) => {
  console.error('FATAL:', String(e.message).slice(0, 250));
  process.exit(1);
});
