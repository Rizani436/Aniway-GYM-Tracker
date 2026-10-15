# Plan: Fitur Progres dari Data yang Sudah Ada (Tier 1 + Tier 2)

Tanggal: 2026-10-15 · Repo: `D:\Project\gym tracker id` (Next.js 15.1.6 App Router, Prisma 6, Supabase, Tailwind, React 19)

## Goal

Menampilkan data yang **sudah tersimpan di DB tapi belum ditampilkan** (1RM, volume, PR, berat badan) + melengkapi alur workout (edit set, RPE, catatan, kalkulator plat) — tanpa migrasi schema.

## Current Context / Assumptions

- **Data sudah ada, UI-nya yang belum ada:**
  - `SetLog.estimated1RM` (dihitung otomatis `weight * (1 + reps/30)`), `SetLog.isPersonalRecord` (di-flag saat simpan), `SetLog.weight/reps/performedAt/setType`, denormalisasi `userId`/`exerciseId`.
  - `BodyWeightLog` (weight, recordedAt, index `[userId, recordedAt Desc]`) — **belum ada satu pun query/UI di src/**.
  - `WorkoutSession.totalVolume`, `.notes`.
- **Yang sudah ada di UI (JANGAN dibuat ulang):**
  - Hapus sesi + edit nama/notes/tanggal sesi → `src/components/riwayat/session-detail-modal.tsx` (293 baris, sudah import `deleteWorkoutSessionAction`, `updateWorkoutSessionAction`). Yang **belum**: edit isi set (weight/reps).
  - Runner workout sudah punya state `sessionNotes` (`workout-runner.tsx:80`) tapi **tidak ada input UI** yang memanggil `setSessionNotes`.
- **Pattern wajib diikuti** (lihat file contoh):
  - Server action: `'use server'` di baris 1, helper `requireUser()` (throw `'Tidak terautentikasi. Silakan login kembali.'`), `prisma` dari `@/lib/prisma`, `revalidatePath('/riwayat')` + `revalidatePath('/')` setelah mutasi, query paralel via `Promise.all`, agregasi di JS bukan N+1.
  - Visual: dark "Obsidian" — kartu `bg-white/[0.03] border border-white/[0.08] rounded-2xl`, aksen emerald, `tabular-nums` untuk angka, tap target ≥36px. Lihat `src/app/page.tsx`.
  - Tanggal: `date-fns` + `locale: id` (`format(new Date(x), 'EEEE, d MMMM yyyy', { locale: id })`).
- **Dependency yang dipakai (sudah terinstall, JANGAN tambah baru):** `recharts@2.15.1` (belum pernah dipakai di src/ — ini pemakaian pertama; wajib `'use client'`), `date-fns@4.1.0`, `zod`, `tsx` (devDep, untuk test script).
- **Tidak ada test framework.** Adaptasi TDD: logika murni → script assert `npx tsx scripts/test-*.ts` (RED dulu, lalu implementasi). Server action / UI → verifikasi `npx next build` + curl + smoke browser.
- Build: pakai `npx next build` (BUKAN `npm run build` — bentrok dependency). Lint: `npm run lint`.
- Kredensial di `.env` — JANGAN pernah di-print/commit.
- Tier 3 (superset, push notification, export CSV) **di luar scope plan ini.**

## Architecture / Approach

Satu file action baru `src/app/actions/statistik-actions.ts` menampung semua query statistik baru (progres gerakan, PR, berat badan) mengikuti pattern action yang ada. Chart = komponen client kecil berbasis recharts yang menerima data jadi dari server page (fetch di server component, bukan client fetch). "Ulangi latihan terakhir" tidak membuat sesi di DB — hanya menyeed daftar gerakan ke runner via param `?repeatSessionId=` yang diubah jadi program sintetis, sehingga mapping state yang sudah ada di runner bekerja tanpa diubah.

---

## Task 0 — Preflight

1. `cd "D:/Project/gym tracker id" && npx next build 2>&1 | tail -5` → **Expected:** `✓ Compiled successfully`, exit 0. Kalau gagal, STOP dan laporkan sebelum lanjut.
2. `npm run lint` → catat baseline warning yang sudah ada (jangan perbaiki di luar scope).
3. Commit baseline tidak perlu (repo clean).

## Task 1 — Kalkulator plat (TDD, logika murni) — kerjakan duluan karena paling terisolasi

1. **RED:** buat `scripts/test-plate-calculator.ts`:

```ts
import assert from 'node:assert';
import { calculatePlates } from '../src/lib/plate-calculator';

// barbell Olympic 20kg, plat tersedia [25, 20, 15, 10, 5, 2.5, 1.25]
// 62.5kg → (62.5-20)/2 = 21.25 per sisi → 15 + 5 + 1.25
assert.deepStrictEqual(calculatePlates(62.5, 20), [15, 5, 1.25]);
// 40kg → 10 per sisi
assert.deepStrictEqual(calculatePlates(40, 20), [10]);
// lebih ringan dari bar → kosong
assert.deepStrictEqual(calculatePlates(15, 20), []);
// beban ganjil yang tak bisa dibentuk → throw dengan pesan jelas
assert.throws(() => calculatePlates(63, 20), /tidak bisa dibentuk/);
console.log('✓ test-plate-calculator lulus');
```

2. Jalankan `npx tsx scripts/test-plate-calculator.ts` → **Expected:** GAGAL (module tidak ada). Itu RED.
3. **GREEN:** buat `src/lib/plate-calculator.ts`:

```ts
const AVAILABLE = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Pecah beban total menjadi plat per sisi. Throw jika beban tidak bisa dibentuk. */
export function calculatePlates(totalWeight: number, barWeight = 20): number[] {
  const perSide = (totalWeight - barWeight) / 2;
  if (perSide < 0) return [];
  const plates: number[] = [];
  let rest = Math.round(perSide * 100) / 100;
  for (const p of AVAILABLE) {
    while (rest >= p - 0.001) {
      plates.push(p);
      rest = Math.round((rest - p) * 100) / 100;
    }
  }
  if (rest > 0.001) {
    throw new Error(`Beban ${totalWeight}kg tidak bisa dibentuk dengan plat tersedia`);
  }
  return plates;
}
```

4. `npx tsx scripts/test-plate-calculator.ts` → **Expected:** `✓ test-plate-calculator lulus`.
5. `git add src/lib/plate-calculator.ts scripts/test-plate-calculator.ts && git commit -m "feat: kalkulator plat barbell (pure function + test)"`

## Task 2 — UI kalkulator plat di runner

1. Buat `src/components/workout/plate-calculator-sheet.tsx` ('use client'): tombol pill `Calculator` (lucide) → bottom sheet (pattern modal yang sudah ada di repo: overlay fixed inset-0 bg-black/60 + panel bawah rounded-t-3xl `bg-[#0f1011] border-t border-white/[0.08]`), input number beban total, tampilkan hasil `calculatePlates()` sebagai chip `15 kg × 1` per sisi + teks "tiap sisi". Error dari throw ditampilkan sebagai teks merah kecil.
2. Render sheet di `src/components/workout/workout-runner.tsx` — taruh tombol di sticky header, sebelah timer. Import ikon dari `lucide-react`.
3. Verifikasi: `npx next build 2>&1 | tail -3` → exit 0. Commit: `feat: UI kalkulator plat di workout runner`.

## Task 3 — Action data progres gerakan

Buat `src/app/actions/statistik-actions.ts` (ikuti header/`requireUser` persis pattern `riwayat-actions.ts:1-15`):

```ts
'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { SetType } from '@prisma/client';
import { format } from 'date-fns';

async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Tidak terautentikasi. Silakan login kembali.');
  return user;
}

export type ProgressPoint = {
  date: string;        // 'yyyy-MM-dd'
  best1RM: number;     // max estimated1RM sesi itu
  topWeight: number;   // beban terberkat sesi itu
  volume: number;      // total volume sesi itu
  isPR: boolean;       // ada set berflag PR di sesi itu
};

export async function getExerciseProgressAction(exerciseId: string): Promise<ProgressPoint[]> {
  const user = await requireUser();
  const sets = await prisma.setLog.findMany({
    where: {
      userId: user.id,
      exerciseId,
      isCompleted: true,
      setType: { not: SetType.WARMUP },
    },
    orderBy: { performedAt: 'asc' },
    select: { performedAt: true, weight: true, reps: true, estimated1RM: true, isPersonalRecord: true },
  });

  // Agregasi per hari (1 sesi = 1 hari dalam praktik; kalau 2x sehari, digabung — cukup untuk chart)
  const byDay = new Map<string, ProgressPoint>();
  for (const s of sets) {
    const date = format(s.performedAt, 'yyyy-MM-dd');
    const cur = byDay.get(date) ?? { date, best1RM: 0, topWeight: 0, volume: 0, isPR: false };
    cur.best1RM = Math.max(cur.best1RM, s.estimated1RM);
    cur.topWeight = Math.max(cur.topWeight, s.weight);
    cur.volume += s.weight * s.reps;
    cur.isPR = cur.isPR || s.isPersonalRecord;
    byDay.set(date, cur);
  }
  // Batasi 90 sesi terakhir agar chart tetap ringan
  return [...byDay.values()].slice(-90);
}
```

Verifikasi: `npx next build 2>&1 | tail -3` → exit 0. Commit: `feat: getExerciseProgressAction untuk grafik progres gerakan`.

## Task 4 — Grafik progres di detail gerakan

1. Buat `src/components/latihan/exercise-progress-chart.tsx` ('use client'):

```tsx
'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ProgressPoint } from '@/app/actions/statistik-actions';

export function ExerciseProgressChart({ data }: { data: ProgressPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 text-center">
        Latihan gerakan ini minimal 2 sesi untuk melihat grafik progres.
      </p>
    );
  }
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Progres 1RM Estimasi</h3>
      {/* Tinggi eksplisit wajib — ResponsiveContainer tidak jalan tanpa parent berukuran */}
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} minTickGap={24} />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0f1011', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)} kg`, name === 'best1RM' ? '1RM Estimasi' : name]}
            />
            <Line type="monotone" dataKey="best1RM" stroke="#10b981" strokeWidth={2} dot={data.length < 30 ? { r: 2.5, fill: '#10b981' } : false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

(Hapus karakter salah yang terbawa `但` di string — itu artefak; string benar: `'Latihan gerakan ini minimal 2 sesi untuk melihat grafik progres.'`)

2. Wiring di `src/app/latihan/gerakan/[id]/page.tsx`: import `getExerciseProgressAction`, panggil paralel — ubah jadi:

```tsx
const [exercise, progress] = await Promise.all([
  getExerciseByIdAction(id),
  getExerciseProgressAction(id).catch(() => []),
]);
```

lalu `<ExerciseDetailClient initialExercise={exercise} progress={progress} />`. Tambah prop `progress?: ProgressPoint[]` di `ExerciseDetailClient` (opsional, default `[]`) dan render `<ExerciseProgressChart data={progress} />` di atas konten detail.
3. Verifikasi: build exit 0; jalankan `npx next start -p 3000` (background), login manual via browser, buka satu gerakan yang punya ≥2 sesi → grafik garis emerald tampil. Commit: `feat: grafik progres 1RM di detail gerakan`.

## Task 5 — Halaman "PR Saya"

1. Tambah di `statistik-actions.ts`:

```ts
export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  performedAt: string; // ISO
};

export async function getPersonalRecordsAction(): Promise<PersonalRecord[]> {
  const user = await requireUser();
  // Flag PR menandai momen rekor; ambil semua lalu pilih yang tertinggi per gerakan.
  // Volume data user aktif = ratusan baris, aman di-agg di JS.
  const prSets = await prisma.setLog.findMany({
    where: { userId: user.id, isPersonalRecord: true, isCompleted: true },
    orderBy: { estimated1RM: 'desc' },
    include: { exercise: { select: { name: true } } },
  });
  const seen = new Set<string>();
  const out: PersonalRecord[] = [];
  for (const s of prSets) {
    if (seen.has(s.exerciseId)) continue;
    seen.add(s.exerciseId);
    out.push({
      exerciseId: s.exerciseId,
      exerciseName: s.exercise.name,
      weight: s.weight,
      reps: s.reps,
      estimated1RM: s.estimated1RM,
      performedAt: s.performedAt.toISOString(),
    });
  }
  return out;
}
```

2. Buat `src/app/riwayat/pr/page.tsx` (server component, `export const dynamic = 'force-dynamic'`): fetch action, render daftar kartu per gerakan — nama gerakan, `weight × reps`, `1RM est` (font-mono emerald), tanggal (`format(..., { locale: id })`), ikon `Trophy` amber. Kartu `bg-white/[0.03] border-white/[0.08] rounded-2xl p-3.5`. Kosong → empty state "Belum ada PR — diautomatis saat kamu pecah rekor di mode workout." Link back ke `/riwayat`.
3. Buat `src/app/riwayat/pr/loading.tsx` — salin pattern skeleton dari `src/app/riwayat/loading.tsx` (wajib: semua rute punya skeleton).
4. Link masuk: di `src/components/riwayat/riwayat-client.tsx`, di header/stats area (dekat angka `totalPRs` yang sudah ada) tambah `Link href="/riwayat/pr"` "Lihat PR →".
5. Verifikasi: build exit 0; curl `/riwayat/pr` tanpa cookie → **Expected 307 ke /login** (middleware). Dengan login browser → halaman tampil. Commit: `feat: halaman PR Saya (riwayat/pr)`.

## Task 6 — Berat badan: action + grafik + input di Profil

1. Tambah di `statistik-actions.ts`:

```ts
export async function getBodyWeightLogsAction() {
  const user = await requireUser();
  const logs = await prisma.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: 'asc' },
    select: { weight: true, recordedAt: true },
    take: 365,
  });
  // Tren 7 hari: rata-rata 7 entri terakhir vs 7 sebelumnya
  const last7 = logs.slice(-7);
  const prev7 = logs.slice(-14, -7);
  const avg = (a: typeof logs) => (a.length ? a.reduce((s, l) => s + l.weight, 0) / a.length : 0);
  const trend7d = last7.length && prev7.length ? avg(last7) - avg(prev7) : null;
  return {
    logs: logs.map((l) => ({ weight: l.weight, recordedAt: l.recordedAt.toISOString() })),
    trend7d,
    latest: logs.length ? logs[logs.length - 1].weight : null,
  };
}

export async function logBodyWeightAction(weight: number) {
  const user = await requireUser();
  if (!(weight > 20 && weight < 300)) throw new Error('Berat badan tidak wajar (20–300 kg).');
  await prisma.bodyWeightLog.create({ data: { userId: user.id, weight } });
  revalidatePath('/profil');
  return { success: true };
}
```

2. Buat `src/components/profil/body-weight-card.tsx` ('use client'): props `{ logs, trend7d, latest }`. Isi: angka terbaru besar (`tabular-nums`, badge tren `+0.4 kg / 7hr` hijau kalau bulking naik / bebas netral), grafik line recharts (height 140, stroke `#10b981`), input number + tombol "Catat" yang panggil `logBodyWeightAction` lalu `router.refresh()`. Pattern kartu ikut `profil/page.tsx` yang ada.
3. Wiring `src/app/profil/page.tsx`: panggil `getBodyWeightLogsAction()` (wrap `.catch(() => ({ logs: [], trend7d: null, latest: null }))` supaya halaman profil tidak mati kalau query gagal), render `<BodyWeightCard ... />` di bawah User Card.
4. Verifikasi: build exit 0; smoke browser: catat berat → angka + titik chart muncul, `router.refresh()` memperbarui. Commit: `feat: log & grafik berat badan di profil`.

## Task 7 — "Ulangi Latihan Terakhir" di Home

1. Extend `getHomeDataAction` (`src/app/actions/latihan-actions.ts`) — tambah query ke-3 di `Promise.all` yang sudah ada:

```ts
lastSession: prisma.workoutSession.findFirst({
  where: { userId: user.id, isCompleted: true },
  orderBy: { startedAt: 'desc' },
  select: { id: true, name: true, startedAt: true },
}),
```

Return `lastSession: lastSession` (null bila tidak ada). Query ini 1 round-trip tambahan tapi paralel — total tetap 1 batch.
2. Tambah param di `getWorkoutInitialDataAction` (`workout-actions.ts`): `programId?: string, repeatSessionId?: string`. Bila `repeatSessionId`:

```ts
// Ambil sesi terakhir milik user + gerakan/set-nya, lalu bentuk "program sintetis"
// agar mapping state di WorkoutRunner (baris ~118-165) bekerja tanpa diubah.
const src = await prisma.workoutSession.findFirst({
  where: { id: repeatSessionId, userId: user.id, isCompleted: true },
  include: {
    exercises: {
      orderBy: { sortOrder: 'asc' },
      include: { exercise: true, sets: { orderBy: { setNumber: 'asc' } } },
    },
  },
});
if (!src) throw new Error('Sesi yang ingin diulang tidak ditemukan.');

const syntheticProgram = {
  id: null,
  name: src.name,
  exercises: src.exercises.map((se) => ({
    exerciseId: se.exerciseId,
    targetSets: se.sets.filter((s) => s.setType !== 'WARMUP').length || 1,
    targetRepMin: Math.min(...(se.sets.map((s) => s.reps).filter(Boolean).length ? se.sets.map((s) => s.reps) : [8])),
    targetRepMax: Math.max(...(se.sets.map((s) => s.reps).filter(Boolean).length ? se.sets.map((s) => s.reps) : [12])),
    restSeconds: se.restSeconds,
    notes: se.notes,
    exercise: se.exercise,
  })),
};
```

**WAJIB dulu:** baca `src/components/workout/workout-runner.tsx` baris 73–170 untuk mencocokkan shape persis (nama field yang dipakai mapping: cek `pe.exerciseId`, `pe.targetSets`, `hist` dari `initialHistoryMap`). Sesuaikan syntheticProgram dengan shape itu — prinsipnya: `initialProgram` ber-shape ProgramExercise + exercise include.
3. `src/app/workout/page.tsx`: baca `repeatSessionId` dari `searchParams`, teruskan ke action.
4. Home `src/app/page.tsx`: di hero card, bila `lastSession` ada render tombol ketiga "Ulangi: {name}" → `href={/workout?repeatSessionId=${lastSession.id}}` (style sekunder sama dengan tombol "Program"). Bila tidak ada sesi, tombol tidak dirender.
5. Verifikasi: build exit 0; smoke browser: Home → "Ulangi: ..." → runner terisi gerakan + beban dari sesi terakhir (historyMap prefill). Commit: `feat: ulangi latihan terakhir dari Home`.

## Task 8 — Edit set dari modal riwayat

1. Tambah di `riwayat-actions.ts`:

```ts
export async function updateSetLogAction(
  setId: string,
  data: { weight: number; reps: number }
) {
  const user = await requireUser();
  const set = await prisma.setLog.findFirst({
    where: { id: setId, userId: user.id },
    include: { sessionExercise: { select: { workoutSessionId: true } } },
  });
  if (!set) throw new Error('Set tidak ditemukan.');

  const weight = Number(data.weight) || 0;
  const reps = Math.max(0, Math.round(Number(data.reps) || 0));
  const estimated1RM =
    reps > 0 && weight > 0 ? Math.round((weight * (1 + reps / 30)) * 10) / 10 : 0;

  await prisma.$transaction([
    prisma.setLog.update({ where: { id: setId }, data: { weight, reps, estimated1RM } }),
    // Hitung ulang volume sesi dari semua set (definisi volume = weight*reps set selesai,
    // sama dengan saveWorkoutSessionAction)
    prisma.workoutSession.update({
      where: { id: set.sessionExercise.workoutSessionId },
      data: { totalVolume: 0 }, // placeholder, diisi langkah 2 di bawah
    }),
  ]);
  // Langkah 2: hitung ulang totalVolume dari seluruh set sesi (aggregate tak bisa mengalikan)
  const sessionSets = await prisma.setLog.findMany({
    where: {
      isCompleted: true,
      sessionExercise: { workoutSessionId: set.sessionExercise.workoutSessionId },
    },
    select: { weight: true, reps: true },
  });
  const totalVolume = sessionSets.reduce((s, x) => s + x.weight * x.reps, 0);
  await prisma.workoutSession.update({
    where: { id: set.sessionExercise.workoutSessionId },
    data: { totalVolume },
  });

  revalidatePath('/riwayat');
  revalidatePath('/');
  return { success: true };
}
```

(Catatan: bentuk 2-langkah di atas sengaja; kalau mau rapi sekali jalan, pindahkan update totalVolume ke SATU `prisma.$transaction` async callback — boleh, asal tetap satu action.)

2. UI `src/components/riwayat/session-detail-modal.tsx`: setiap baris set yang sudah menampilkan weight/reps ubah jadi `<input type="number" inputMode="decimal">` kecil (width ~64px, `tabular-nums`), `onBlur` → panggil `updateSetLogAction` bila nilai berubah, lalu `onUpdated()` (prop yang sudah ada) untuk refresh. Tambah guard `isSaving` per baris supaya tidak dobel-submit.
3. Verifikasi: build exit 0; smoke: ubah beban satu set → modal & daftar menampilkan nilai baru + volume sesi berubah. Commit: `feat: edit beban/reps set dari riwayat`.

## Task 9 — RPE di runner

1. **Verifikasi persistence dulu:** `grep -n "rpe" src/app/actions/workout-actions.ts`. Schema validasi (`src/lib/validations.ts:89`) sudah punya `rpe`. Kalau loop create setLog di `saveWorkoutSessionAction` TIDAK menulis `rpe` → tambahkan `rpe: s.rpe ?? null` di `data` create-nya. Cek juga draft persist (`localStorage` draft di runner, kunci `storageKey`) ikut menyimpan rpe.
2. UI `src/components/workout/exercise-set-row.tsx` (`memo` — jaga perf): tombol kecil (min 36px) di baris set menampilkan `RPE {n}` atau `RPE` abu; tap → popover inline grid 1–10 (grid-cols-5, tombol 36px) + opsi kosongkan. Pilih → update state set di runner via handler yang sudah ada (pattern `handleUpdateSet` — cek signature-nya, tambahkan field `rpe`).
3. Verifikasi: build exit 0; smoke: set RPE 8 → selesaikan sesi → buka riwayat → RPE tersimpan (cek via DB `prisma studio` atau tampilkan di modal detail bila sudah dirender). Commit: `feat: input RPE opsional di workout runner`.

## Task 10 — Input catatan sesi di runner

1. `src/components/workout/workout-runner.tsx`: state `sessionNotes` sudah ada (line 80) + ikut draft (line 203/237) + tersimpan ke action (line 465). Yang kurang hanya UI: tambah textarea 1–2 baris ("Catatan sesi…") di area bawah sebelum tombol selesaikan sesi, `value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)}`. Tidak ada perubahan action/schema.
2. Verifikasi: build exit 0; smoke: tulis catatan → selesaikan sesi → detail sesi di riwayat menampilkan catatan (modal sudah me-render `notes`? cek; bila belum, tampilkan `<p>` notes di modal). Commit: `feat: input catatan sesi di runner`.

## Task 11 — Finalisasi

1. `npx next build 2>&1 | tail -5` → `✓ Compiled successfully`, exit 0.
2. `npm run lint` → tidak ada error baru vs baseline Task 0.
3. Restart server prod lokal: kill PID di port 3000 (`netstat -ano | grep ":3000"` → `MSYS_NO_PATHCONV=1 taskkill /F /PID <pid>`) → `npx next start -p 3000` background → `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login` → `200`.
4. Smoke matrix (browser, login dulu): Home (tombol Ulangi tampil) → /workout?repeatSessionId=… (runner terisi) → selesaikan sesi → /riwayat (sesi baru + volume) → edit set → /riwayat/pr (PR muncul) → /latihan/gerakan/[id] (grafik) → /profil (berat badan).
5. Update ZIP: `python -c "..."` pakai script zip yang sudah ada polanya (exclude node_modules/.next/.git) → `D:\Project\besilog-gym-tracker-tahap3.zip` ter-update.
6. Commit terakhir bila ada sisa: `chore: finalisasi fitur progres`.

## Tests / Validation (ringkas)

- **Unit (logika murni):** `npx tsx scripts/test-plate-calculator.ts` → `✓ test-plate-calculator lulus`. (Satu-satunya logika murni baru; agregasi chart sengaja inline sederhana — jika ingin, tambah `scripts/test-progress-series.ts` dengan assert agregasi per hari, pola sama RED→GREEN.)
- **Build gate tiap task:** `npx next build 2>&1 | tail -3` → exit 0.
- **Auth gate:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/riwayat/pr` tanpa cookie → `307`.
- **Smoke matrix** di Task 11.4 adalah acceptance test fungsional.

## Risks / Tradeoffs / Open Questions

- **Recharts + React 19:** `recharts@2.15.1` resmi support React 19. Kalau ada warning hydration, bungkus chart dengan `dynamic(() => import(...), { ssr: false })` — jangan instal versi lain.
- **`ResponsiveContainer` butuh parent bertinggi eksplisit** — sudah diantisipasi di kode (`style={{ height: 180 }}`).
- **Synthetic program (Task 7) bergantung pada shape internal runner** — implementer WAJIB baca mapping runner dulu; kalau shape tidak cocok, opsi cadangan: kirim array terpisah `repeatExercises` dan tambahkan branch kecil di inisialisasi state (lebih invasive — hindari).
- **Flag PR tidak dihitung ulang saat edit set (Task 8)** — keputusan sadar: flag menandai momen historis; recompute semua flag mahal dan rawan salah. Volume & 1RM set ya dihitung ulang.
- **Agregasi chart per hari** menggabungkan 2 sesi di hari yang sama jadi 1 titik — tradeoff sadar, cukup untuk kebutuhan visual.
- **Open question kecil** (tidak memblokir): lokasi PR page dipilih `/riwayat/pr` + link dari header riwayat; alternatif tab segmented di riwayat. Kalau user mau tab, ubah Task 5.4 saja.
- Estimasi total: ~4–6 jam kerja fokus; setiap task independent dan sudah bisa di-commit terpisah.
