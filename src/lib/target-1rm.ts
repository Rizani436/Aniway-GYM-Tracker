/**
 * Logika Target 1RM — dipakai bersama actions (server) & UI (badge progres).
 * Dipisah dari komponen supaya bisa diuji unit (vitest) tanpa React/DB.
 *
 * ATURAN: nilai target & 1RM disimpan kanonik kg. Konversi satuan tampilan
 * sudah ditangani lib/units sebelum nilai masuk sini.
 */

/** Formula Epley: estimasi 1RM dari berat & reps satu set.
 *  1 rep = berat itu sendiri (Epley murni melebih-estimasi 3,3% di reps=1). */
export function estimateEpley(weightKg: number, reps: number): number {
  const w = Number(weightKg);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
  if (r <= 1) return w;
  return w * (1 + r / 30);
}

/** Persen pencapaian PR vs target. Null kalau tak bisa dihitung (badge hilang). */
export function pctOfTarget(best1RM: number | null | undefined, target: number | null | undefined): number | null {
  const b = Number(best1RM);
  const t = Number(target);
  if (!Number.isFinite(b) || !Number.isFinite(t) || b <= 0 || t <= 0) return null;
  return (b / t) * 100;
}

/** Status badge: null = tak tampil, 'progress' = kuning, 'done' = hijau >= 100%. */
export function badgeStatus(pct: number | null): 'progress' | 'done' | null {
  if (pct === null || !Number.isFinite(pct)) return null;
  return pct >= 100 ? 'done' : 'progress';
}

/** Validasi input target 1RM (kg kanonik) sebelum ke DB: kosong/null boleh. */
export const zTarget1RM = (val: unknown): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Ceiling wajar: rekor dunia deadlift ~501 kg; lebih dari itu salah ketik.
  if (n > 600) return null;
  return n;
};
