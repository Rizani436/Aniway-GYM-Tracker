// Uji perilaku addTime timer istirahat — logika identik dgn workout-timer-bar.tsx
let deadline = Date.now() + 90 * 1000;
function remaining() { return Math.max(0, Math.round((deadline - Date.now()) / 1000)); }
function addTime(s) { deadline = Math.max(Date.now(), deadline + s * 1000); return remaining(); }

const t0 = Date.now();
while (Date.now() - t0 < 1000); // jeda 1s -> sisa ~89
const before = remaining();
const afterPlus = addTime(15);
const afterMinus = addTime(-15);
const afterMinusMinus = addTime(-15);
console.log('sebelum       :', before, '(harap ~89)');
console.log('setelah +15   :', afterPlus, '(harap ~' + (before + 15) + ')');
console.log('setelah -15   :', afterMinus, '(harap ~' + before + ')');
console.log('setelah -15x2 :', afterMinusMinus, '(harap ~' + (before - 15) + ')');

// bukti tick TIDAK menimpa: baca ulang setelah 600ms tanpa addTime
setTimeout(() => {
  const r = remaining();
  console.log('3 tick (600ms):', r, '(harap ~' + (before - 16) + ', BUKAN kembali ke ~89)');
  const ok = Math.abs(r - (before - 16)) <= 1;
  console.log(ok ? '=> LOLOS: penyesuaian bertahan, tick tidak menimpa' : '=> GAGAL');
  process.exit(ok ? 0 : 1);
}, 600);
