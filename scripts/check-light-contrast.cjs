// A2: hitung kontras WCAG pasangan warna tema terang yang paling berisiko.
// Aksen (emerald/amber/sky/rose) di atas latar terang #f7f8f8 — kalau rasio
// < 3:1 (teks besar/UI) atau < 4.5:1 (teks kecil), pasangan itu masuk daftar
// perbaikan. Murni hitung, tanpa DB.
const LUM = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [a, b] = [LUM(fg), LUM(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const BG_TERANG = '#f7f8f8';
const SURFACE = '#ffffff';

// Warna Tailwind yang dipakai sebagai TEKS di komponen (hasil grep):
const pasangan = [
  ['emerald-400', '#34d399', 'badge ikon / teks aksen (57 pemakai)'],
  ['emerald-500', '#10b981', 'angka PR, teks aktif'],
  ['emerald-600', '#059669', 'kandidat pengganti teks'],
  ['emerald-700', '#047857', 'kandidat pengganti teks'],
  ['amber-300', '#fcd34d', 'banner offline/peringatan (11)'],
  ['amber-500', '#f59e0b', 'kandidat pengganti'],
  ['amber-600', '#d97706', 'kandidat pengganti'],
  ['amber-700', '#b45309', 'kandidat pengganti'],
  ['sky-300', '#7dd3fc', 'teks antrean sync (2)'],
  ['sky-600', '#0284c7', 'kandidat pengganti'],
  ['rose-400', '#fb7185', 'pesan error (13)'],
  ['rose-500', '#f43f5e', 'kandidat pengganti'],
  ['rose-600', '#e11d48', 'kandidat pengganti'],
  ['rose-700', '#be123c', 'kandidat pengganti'],
];

console.log('Pasangan vs BG terang (#f7f8f8) — standar: 4.5 teks kecil, 3.0 teks besar/UI:');
for (const [nama, hex, ket] of pasangan) {
  const r1 = ratio(hex, BG_TERANG);
  const r2 = ratio(hex, SURFACE);
  const lulus1 = r1 >= 4.5 ? 'OK4.5' : r1 >= 3 ? 'UI-ONLY' : 'GAGAL';
  const lulus2 = r2 >= 4.5 ? 'OK4.5' : r2 >= 3 ? 'UI-ONLY' : 'GAGAL';
  console.log(
    `${nama.padEnd(12)} ${r1.toFixed(2).padStart(5)} (${lulus1})  vs putih ${r2.toFixed(2).padStart(5)} (${lulus2})  — ${ket}`
  );
}
