/** Plat KG standar gym. */
export const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
/** Plat LB standar gym. */
export const LB_PLATES = [45, 35, 25, 10, 5, 2.5];

/**
 * Pecah beban total menjadi plat per sisi barbell.
 * Default bar Olympic 20 kg (atau 45 lb bila memakai plat LB).
 * Return [] bila beban lebih ringan dari bar. Throw bila beban tak bisa dibentuk.
 */
export function calculatePlates(
  totalWeight: number,
  barWeight = 20,
  available: number[] = KG_PLATES
): number[] {
  const perSide = (totalWeight - barWeight) / 2;
  if (perSide < 0) return [];
  const plates: number[] = [];
  let rest = Math.round(perSide * 100) / 100;
  for (const p of available) {
    while (rest >= p - 0.001) {
      plates.push(p);
      rest = Math.round((rest - p) * 100) / 100;
    }
  }
  if (rest > 0.001) {
    throw new Error(`Beban ${totalWeight} tidak bisa dibentuk dengan plat tersedia`);
  }
  return plates;
}
