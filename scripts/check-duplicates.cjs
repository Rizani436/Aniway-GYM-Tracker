// Deteksi duplikat dekat antara gerakan baru dan gerakan yang sudah ada di DB,
// plus sesama gerakan baru. Normalisasi agresif: buang kata umum, buang akhiran 's'.
const fs = require('fs');
const TMP = process.env.LOCALAPPDATA + '/Temp';
const usable = JSON.parse(fs.readFileSync(TMP + '/curated-usable.json', 'utf8'));
const existing = fs
  .readFileSync(TMP + '/existing-names.txt', 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const STOP = new Set(['with', 'on', 'the', 'a', 'and', 'to', 'of', 'in', 'for', 'version', 'machine', 'mesin', 'at']);
const key = (name) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')          // buang isi kurung
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w)) // siku -> siku, curls->curl
    .sort()
    .join(' ');

const existingKeys = new Map(existing.map((n) => [key(n), n]));
const dupLama = [];
const seen = new Map();
const dupBaru = [];

for (const u of usable) {
  const k = key(u.name);
  if (existingKeys.has(k)) dupLama.push(`${u.name}  ≈ LAMA: ${existingKeys.get(k)}`);
  if (seen.has(k)) dupBaru.push(`${u.name}  ≈ BARU: ${seen.get(k)}`);
  else seen.set(k, u.name);
}

// Kemiripan token: >80% token sama juga dianggap duplikat dekat
const tokens = (n) => new Set(key(n).split(' '));
const dekat = [];
for (const u of usable) {
  const t1 = tokens(u.name);
  for (const lama of existing) {
    const t2 = tokens(lama);
    const irisan = [...t1].filter((x) => t2.has(x)).length;
    const skor = irisan / Math.max(t1.size, t2.size);
    if (skor >= 0.8 && key(u.name) !== key(lama)) dekat.push(`${u.name}  ~${Math.round(skor * 100)}% ${lama}`);
  }
}

console.log('gerakan baru:', usable.length, '| gerakan lama:', existing.length);
console.log('\nDUPLIKAT PERSIS (normalisasi):', dupLama.length);
dupLama.forEach((d) => console.log('  =', d));
console.log('\nDUPLIKAT SESAMA BARU:', dupBaru.length);
dupBaru.forEach((d) => console.log('  =', d));
console.log('\nMIRIP TAPI TIDAK PERSIS (perlu tinjauan):', dekat.length);
dekat.forEach((d) => console.log('  ~', d));

const buang = new Set([...dupLama, ...dupBaru].map((s) => s.split('  ')[0]));
fs.writeFileSync(TMP + '/duplikat.json', JSON.stringify({ persis: [...buang], mirip: dekat }, null, 1));
console.log('\nkandidat yang sebaiknya DIBUANG (duplikat persis):', buang.size);
