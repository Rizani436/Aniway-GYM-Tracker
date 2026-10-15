const AVAILABLE = [25, 20, 15, 10, 5, 2.5, 1.25];

/**
 * Pecah beban total menjadi plat per sisi barbell.
 * Default bar Olympic 20 kg, plat tersedia [25, 20, 15, 10, 5, 2.5, 1.25].
 * Return [] bila beban lebih ringan dari bar. Throw bila beban tak bisa dibentuk.
 */
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
