import { WeightUnit } from '@prisma/client';

/**
 * Konversi & format satuan berat.
 *
 * ATURAN KANONIK: seluruh nilai beban di database DISIMPAN dalam KG.
 * `User.weightUnit` hanyalah preferensi TAMPILAN. Saat user memilih LB:
 *   - tampilan  : kg -> lb   (× LB_PER_KG)
 *   - input     : lb -> kg   (× KG_PER_LB) sebelum disimpan
 * Dengan begitu tidak ada angka yang "berubah makna" di DB dan statistik
 * (volume, PR, 1RM) tetap konsisten di semua halaman.
 */

export const LB_PER_KG = 2.2046226218;
export const KG_PER_LB = 1 / LB_PER_KG;

/** Normalisasi nilai satuan (toleran terhadap 'KG'/'kg'/'LB'/'lb'). */
export function isLb(unit: WeightUnit | string | null | undefined): boolean {
  return String(unit ?? '').toUpperCase() === 'LB';
}

/** kg (kanonik) -> nilai tampilan sesuai satuan user. */
export function toDisplayWeight(kg: number, unit: WeightUnit | string | null | undefined): number {
  const v = Number(kg) || 0;
  return isLb(unit) ? v * LB_PER_KG : v;
}

/** Nilai input user (dalam satuannya) -> kg kanonik untuk disimpan. */
export function toKg(value: number, unit: WeightUnit | string | null | undefined): number {
  const v = Number(value) || 0;
  return isLb(unit) ? v * KG_PER_LB : v;
}

/** Pembulatan berat untuk tampilan. KG: 1 desimal; LB: 1 desimal (ramah gym). */
export function roundWeight(value: number, unit: WeightUnit | string | null | undefined): number {
  const d = toDisplayWeight(value, unit);
  return Math.round(d * 10) / 10;
}

/** Label satuan ('kg' | 'lb'). */
export function weightUnitLabel(unit: WeightUnit | string | null | undefined): string {
  return isLb(unit) ? 'lb' : 'kg';
}

/** Format angka berat + label dalam satu string, mis. "62.5 kg" / "137.8 lb". */
export function formatWeight(
  kg: number,
  unit: WeightUnit | string | null | undefined,
  options?: { decimals?: number }
): string {
  const decimals = options?.decimals ?? 1;
  const d = toDisplayWeight(kg, unit);
  const s = Number.isInteger(d) ? String(d) : d.toFixed(decimals);
  return `${s} ${weightUnitLabel(unit)}`;
}
