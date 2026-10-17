// Kurasi kandidat gerakan: buang stretch/SMR/plyo-tidak-jelas, fokus gerakan
// latihan beban yang benar-benar ada di gym. Lalu verifikasi gambar 2 sudut.
const fs = require('fs');
const DB = JSON.parse(fs.readFileSync(process.env.LOCALAPPDATA + '/Temp/fedb.json', 'utf8'));
const BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

const MUSCLE = {
  abdominals: 'ABS', glutes: 'GLUTES', calves: 'CALVES', forearms: 'FOREARMS',
  quadriceps: 'QUADS', hamstrings: 'HAMSTRINGS', chest: 'CHEST', shoulders: 'SHOULDERS',
  biceps: 'BICEPS', triceps: 'TRICEPS', lats: 'BACK', 'middle back': 'BACK',
  'lower back': 'BACK', traps: 'BACK', abductors: 'GLUTES', adductors: 'QUADS',
};
const EQUIP = {
  barbell: 'BARBELL', dumbbell: 'DUMBBELL', 'body only': 'BODYWEIGHT',
  cable: 'CABLE', machine: 'MACHINE', 'e-z curl bar': 'BARBELL',
};

// Buang: peregangan, SMR/foam roll, latihan aneh/alat tidak umum,
// plyometric tak terukur, dan gerakan yang tidak bisa dibebani.
const BLOCK = [
  'stretch', 'smr', 'foam roll', 'balance board', 'peroneals', 'tibialis', 'it band',
  'circles', 'windmill', 'walk', 'carry', 'duck walk', 'sprint', 'jump rope',
  'neck', 'wrist circles', 'shoulder circles', 'dislocate', 'shadow', 'boxing',
  'clean and jerk', 'snatch', 'power clean', 'hang clean', 'jerk', 'olympic',
  'butt lift', 'flutter kick', 'crossover', 'quad stretch', 'cat stretch',
  'dog stretch', 'spinal', 'bird dog', 'swimmer', 'scissor', 'frog', 'arm wrap',
  'crunch - hands overhead', 'jackknife', 'otis-up', 'spell caster', 'sledgehammer',
  'bent press', 'windmill', 'plate twist', 'fast skipping', 'butt kick',
  'bench jump', 'box jump', 'knee tuck', 'inchworm', 'rear lunge', 'side split',
];

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const existingNames = fs.readFileSync(process.env.LOCALAPPDATA + '/Temp/existing-names.txt', 'utf8')
  .split('\n').map(norm).filter(Boolean);

// Target: tutup celah otot + alat yang belum ada sama sekali di DB.
// Nilai = berapa gerakan yang mau diambil untuk kombinasi itu.
const PLAN = {
  DUMBBELL: { GLUTES: 3, QUADS: 3, HAMSTRINGS: 3, CHEST: 3, BACK: 3, SHOULDERS: 3, BICEPS: 2, TRICEPS: 2, CALVES: 2, ABS: 2, FOREARMS: 1 },
  BARBELL: { GLUTES: 3, QUADS: 3, HAMSTRINGS: 3, CHEST: 2, BACK: 3, SHOULDERS: 2, CALVES: 2, ABS: 1, FOREARMS: 1 },
  BODYWEIGHT: { GLUTES: 3, ABS: 3, QUADS: 2, HAMSTRINGS: 2, CHEST: 2, TRICEPS: 2, BACK: 2, CALVES: 2 },
  CABLE: { GLUTES: 2, HAMSTRINGS: 2, CHEST: 2, BACK: 3, SHOULDERS: 2, BICEPS: 2, TRICEPS: 2, ABS: 2, FOREARMS: 1 },
  MACHINE: { GLUTES: 2, HAMSTRINGS: 1, ABS: 1, CALVES: 1, FOREARMS: 1 },
};

const pool = [];
for (const ex of DB) {
  const pm = MUSCLE[(ex.primaryMuscles || [])[0]];
  const eq = EQUIP[ex.equipment];
  if (!pm || !eq) continue;
  if (!PLAN[eq] || !PLAN[eq][pm]) continue;
  if (!ex.images || ex.images.length < 2) continue;
  const low = ex.name.toLowerCase();
  if (BLOCK.some((b) => low.includes(b))) continue;
  if (existingNames.includes(norm(ex.name))) continue;
  pool.push({
    name: ex.name, primaryMuscle: pm, equipment: eq, level: ex.level,
    mechanic: ex.mechanic, force: ex.force,
    secondary: [...new Set((ex.secondaryMuscles || []).map((m) => MUSCLE[m]).filter(Boolean))],
    images: ex.images.map((p) => BASE + p), catId: ex.id,
    instructions: ex.instructions || [],
  });
}

// Pilih: penuhi PLAN, prioritaskan compound (mechanic=compound) & level beginner/intermediate
const picked = [];
const quota = JSON.parse(JSON.stringify(PLAN));
const ranked = pool.sort((a, b) => {
  const score = (x) => (x.mechanic === 'compound' ? 0 : 1) * 10 + (x.level === 'beginner' ? 0 : x.level === 'intermediate' ? 1 : 2);
  return score(a) - score(b) || a.name.length - b.name.length;
});
for (const c of ranked) {
  if (quota[c.equipment][c.primaryMuscle] > 0) {
    picked.push(c);
    quota[c.equipment][c.primaryMuscle]--;
  }
}
const sisa = Object.entries(quota).flatMap(([eq, m]) => Object.entries(m).filter(([, n]) => n > 0).map(([mm, n]) => `${eq}/${mm}:${n}`));
console.log('terpilih:', picked.length, '| kuota belum terpenuhi:', sisa.length ? sisa.join(' ') : 'semua terpenuhi');

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (method === 'GET' && r.body) await r.body.cancel();
      if (r.status === 200) return true;
      if (method === 'HEAD') continue;
    } catch {}
  }
  return false;
}

(async () => {
  const ok = [];
  for (let i = 0; i < picked.length; i += 12) {
    const batch = picked.slice(i, i + 12);
    const res = await Promise.all(batch.map(async (c) => ((await Promise.all(c.images.map(check))).every(Boolean) ? c : null)));
    ok.push(...res.filter(Boolean));
    console.log('  diverifikasi', Math.min(i + 12, picked.length), '/', picked.length, '| hidup:', ok.length);
  }
  const eqCount = {}, mCount = {};
  for (const c of ok) { eqCount[c.equipment] = (eqCount[c.equipment] || 0) + 1; mCount[c.primaryMuscle] = (mCount[c.primaryMuscle] || 0) + 1; }
  console.log('\nHIDUP:', ok.length, '| per alat:', JSON.stringify(eqCount), '| per otot:', JSON.stringify(mCount));
  fs.writeFileSync(process.env.LOCALAPPDATA + '/Temp/curated.json', JSON.stringify(ok, null, 1));
  ok.forEach((c) => console.log(`  ${c.equipment.padEnd(11)} ${c.primaryMuscle.padEnd(11)} ${c.name}  [${c.level}/${c.mechanic || '-'}]`));
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
