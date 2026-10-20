// Jalankan pengukuran action N kali dan laporkan tingkat keberhasilan.
// Dipakai untuk membuktikan fix: dulu 5/5 GAGAL di ~5030 ms (P1001).
const { execFileSync } = require('child_process');
const path = require('path');

const N = Number(process.argv[2] || 5);
const script = path.join(__dirname, 'measure-workout-action.cjs');
let sukses = 0, gagal = 0;
const waktu = [];

for (let i = 1; i <= N; i++) {
  let out = '';
  try {
    out = execFileSync(process.execPath, [script], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = String(e.stdout || '') + String(e.stderr || '');
  }
  const mTotal = out.match(/TOTAL action\s*:\s*(\d+)\s*ms/);
  const mGagal = out.match(/GAGAL di riwayat setelah (\d+) ms:\s*(\S+)/);
  if (mTotal) {
    sukses++;
    waktu.push(Number(mTotal[1]));
    console.log('percobaan ' + i + ': SUKSES  ' + mTotal[1] + ' ms');
  } else if (mGagal) {
    gagal++;
    console.log('percobaan ' + i + ': GAGAL   ' + mGagal[1] + ' ms  (' + mGagal[2] + ')');
  } else {
    gagal++;
    console.log('percobaan ' + i + ': GAGAL   (output tak terduga)');
    console.log(out.split('\n').slice(-4).join('\n'));
  }
}

console.log('\nhasil: ' + sukses + '/' + N + ' sukses, ' + gagal + '/' + N + ' gagal');
if (waktu.length) {
  const rata = Math.round(waktu.reduce((a, b) => a + b, 0) / waktu.length);
  console.log('waktu total action: rata ' + rata + ' ms, min ' + Math.min(...waktu) + ', maks ' + Math.max(...waktu) + ' ms');
}
process.exit(gagal === 0 ? 0 : 1);
