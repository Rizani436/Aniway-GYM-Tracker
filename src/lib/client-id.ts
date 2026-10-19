/** ID unik sisi klien untuk kunci idempotensi (bukan kripto, hanya perlu unik). */
export function newClientSessionId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  const r2 = Math.random().toString(36).slice(2, 10);
  return `off_${t}_${r}${r2}`;
}
