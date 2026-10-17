// Gabungkan kandidat terverifikasi + konten Bahasa Indonesia menjadi entri seed,
// lalu tulis ke prisma/seed-new-exercises.ts (data murni, di-import oleh seed.ts).
//
// Dijalankan dari root repo: node scripts/build-seed-entries.cjs
const fs = require('fs');
const TMP = process.env.LOCALAPPDATA + '/Temp';

const usableAll = JSON.parse(fs.readFileSync(TMP + '/curated-usable.json', 'utf8'));

// Buang duplikat yang terdeteksi (scripts/check-duplicates.cjs):
//  - 'Seated Cable Rows' identik dengan gerakan lama 'Seated Cable Row'
//  - 'Incline Cable Chest Press' identik dengan gerakan lama 'Incline Chest Press Machine'
//    (memakai gambar yang sama, jadi jelas gerakan yang sama)
const DROP = new Set(['Seated Cable Rows', 'Incline Cable Chest Press']);
const usable = usableAll.filter((u) => !DROP.has(u.name));
if (usable.length !== usableAll.length) {
  console.log('dibuang (duplikat):', usableAll.length - usable.length, [...DROP].join(', '));
}

// Kumpulkan konten dari 4 berkas keluaran penulis konten
const olehNo = new Map();
for (let c = 1; c <= 4; c++) {
  const f = `${TMP}/translate-out-${c}.json`;
  if (!fs.existsSync(f)) {
    console.error('BELUM ADA:', f);
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const o of arr) {
    if (olehNo.has(o.no)) console.error('DUPLIKAT nomor', o.no);
    olehNo.set(o.no, o);
  }
}
console.log('konten terkumpul:', olehNo.size, 'dari', usable.length, 'gerakan');

// Validasi & laporan masalah
const masalah = [];
for (const u of usable) {
  const c = olehNo.get(u.no);
  if (!c) { masalah.push(`${u.no} ${u.name}: KONTEN HILANG`); continue; }
  if (!Array.isArray(c.steps) || c.steps.length < 3) masalah.push(`${u.no} ${u.name}: steps < 3`);
  if (!Array.isArray(c.tips) || c.tips.length < 2) masalah.push(`${u.no} ${u.name}: tips < 2`);
  if (!Array.isArray(c.commonMistakes) || c.commonMistakes.length < 2)
    masalah.push(`${u.no} ${u.name}: commonMistakes < 2`);
}
if (masalah.length) {
  console.error('\nMASALAH KONTEN:');
  masalah.forEach((m) => console.error('  -', m));
  process.exit(1);
}

// Increment beban per alat (aturan sederhana & konsisten dengan seed lama:
// mesin/stack 5, plate loaded 10, kabel 2.5, barbell/dumbbell 2.5, berat badan 5 (mengikuti konvensi lama))
const INCREMENT = {
  MACHINE: 5, PLATE_LOADED: 10, CABLE: 2.5, SMITH_MACHINE: 5,
  DUMBBELL: 2.5, BARBELL: 2.5, BODYWEIGHT: 5, OTHER: 5,
};

const slugVideo = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '+').replace(/^\+|\+$/g, '');
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const arr = (list) => `[\n      ${list.map(q).join(',\n      ')}\n    ]`;

const entries = usable.map((u) => {
  const c = olehNo.get(u.no);
  const inc = INCREMENT[u.equipment] ?? 5;
  const secondary = u.secondaryMuscles.filter((m) => m !== u.primaryMuscle);
  return `  {
    name: ${q(u.name)},
    primaryMuscle: MuscleGroup.${u.primaryMuscle},
    secondaryMuscles: [${secondary.map((m) => `MuscleGroup.${m}`).join(', ')}],
    equipment: EquipmentType.${u.equipment},
    weightIncrement: ${inc},
    steps: ${arr(c.steps)},
    tips: ${arr(c.tips)},
    commonMistakes: ${arr(c.commonMistakes)},
    videoUrl: ${q(`https://www.youtube.com/results?search_query=${slugVideo(u.name)}+form`)},
    imageUrl: ${q(u.images[0])},
    alternatives: [],
  },`;
});

const header = `import { MuscleGroup, EquipmentType } from '@prisma/client';
import type { SeedExercise } from './seed';

// DIBANGKITKAN OTOMATIS oleh scripts/build-seed-entries.cjs — jangan edit manual.
//
// ${entries.length} gerakan hasil kurasi dari free-exercise-db (Unlicense), dipilih untuk
// menutup celah pustaka: sebelum ini 0 gerakan dumbbell/barbell/berat badan, dan
// otot GLUTES/ABS/CALVES/FOREARMS sangat sedikit. Setiap URL gambar sudah diverifikasi
// membalas HTTP 200 (dua sudut foto: 0.jpg posisi awal, 1.jpg posisi akhir).
export const newExercises: SeedExercise[] = [
`;
const footer = `];
`;

fs.writeFileSync('prisma/seed-new-exercises.ts', header + entries.join('\n') + '\n' + footer);
console.log('ditulis prisma/seed-new-exercises.ts |', entries.length, 'entri');
const eq = {}, mu = {};
for (const u of usable) { eq[u.equipment] = (eq[u.equipment] || 0) + 1; mu[u.primaryMuscle] = (mu[u.primaryMuscle] || 0) + 1; }
console.log('per alat:', JSON.stringify(eq));
console.log('per otot:', JSON.stringify(mu));
