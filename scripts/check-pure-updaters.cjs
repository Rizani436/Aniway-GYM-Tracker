// Penjaga regresi: deteksi efek samping DI DALAM fungsi updater state React.
//
// Kenapa penting: updater setState((prev) => ...) HARUS murni. React berhak
// memanggilnya 2x (StrictMode) atau membuang hasilnya. Efek samping di dalamnya
// jadi "kadang jalan kadang tidak" — kasus nyata di proyek ini: timer istirahat
// per set kadang muncul kadang tidak karena setActiveRestTimer dipanggil di dalam
// updater setExercises, sehingga tombol +/-15 detik terasa "kadang bisa".
//
// Pakai: node scripts/check-pure-updaters.cjs    (exit 0 = bersih)
const fs = require('fs');
const path = require('path');

const ROOTS = ['src'];
const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
  }
})('src');

// Pola panggilan yang merupakan efek samping (bukan pembuatan nilai).
const SIDE = /(^|[^.\w])(set[A-Z][A-Za-z]*\(|localStorage\.|sessionStorage\.|play[A-Z][A-Za-z]*\(|\.vibrate\(|enqueueSession\(|saveWorkoutSnapshot\(|confirm\(|alert\(|console\.(log|error|warn)|document\.|navigator\.|fetch\()/;

// Penamaan setter React: setXxx diikuti huruf kapital atau digit, dan BUKAN
// API bawaan global seperti setInterval/setTimeout/setImmediate.
const BUKAN_SETTER = /^set(Interval|Timeout|Immediate)$/;
const RE_UPDATER = /set([A-Z][A-Za-z]*[0-9]*|set)\s*\(\s*(?:\([^)]*\)|[A-Za-z_][\w]*)\s*=>/;

const findings = [];

for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    // Updater = setX(<params>) => ... — argumen PERTAMA berupa fungsi.
    // `setSecondsLeft(next)` BUKAN updater (argumennya nilai), jadi jangan cocok.
    const m = lines[i].match(RE_UPDATER);
    if (!m) continue;
    const setterName = 'set' + m[1];
    if (BUKAN_SETTER.test(setterName)) continue; // setInterval/setTimeout bukan setter React

    let depth = 0, started = false;
    for (let j = i; j < lines.length; j++) {
      const L = lines[j];
      for (const ch of L) {
        if (ch === '{' || ch === '(') { depth++; started = true; }
        else if (ch === '}' || ch === ')') depth--;
      }
      if (j === i) continue;
      const isUpdaterHead = new RegExp(setterName + '\\(\\s*(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>').test(L);
      const isComment = /^\s*(\/\/|\*|\/\*)/.test(L);
      const onlyValue = /^\s*(const|let|return)\b/.test(L) && !/\bset[A-Z][A-Za-z]*\(/.test(L);
      if (!isUpdaterHead && !isComment && !onlyValue && SIDE.test(L) && L.trim() !== '') {
        findings.push({ file: f, line: j + 1, setter: setterName, code: L.trim().slice(0, 100) });
      }
      if (started && depth <= 0) break;
    }
  }
}

console.log('Berkas diperiksa:', files.length);
if (findings.length === 0) {
  console.log('HASIL: bersih — 0 efek samping di dalam updater state  ✓');
  process.exit(0);
}
console.log('HASIL: ' + findings.length + ' temuan — updater tidak murni  ✗');
for (const x of findings) console.log('  ' + x.file + ':' + x.line + '  [' + x.setter + ']  ' + x.code);
process.exit(1);
