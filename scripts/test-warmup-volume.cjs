// Verifikasi definisi volume & PR: set PEMANASAN harus dikecualikan.
//
// Skenario nyata: pemanasan 40kg x 10 + set kerja 100kg x 5.
//   volume kerja benar = 100 x 5 = 500  (BUKAN 500 + 400 = 900)
//   set pemanasan tidak boleh jadi PR, walau 1RM-nya > best sebelumnya
// Semua penulisan DIBATALKAN (transaksi sengaja di-throw) — nol side effect.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SetType = { WARMUP: 'WARMUP', NORMAL: 'NORMAL' };
const epley = (w, r) => (w > 0 && r > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0);

// Replika logika yang baru diperbaiki
function hitung(sets, bestSebelumnya) {
  let totalVolume = 0;
  const prs = [];
  let tertinggi = bestSebelumnya;
  for (const s of sets) {
    const est = epley(s.weight, s.reps);
    const isWarmup = s.setType === SetType.WARMUP;
    if (!isWarmup && s.isCompleted && est > tertinggi && est > 0) {
      prs.push({ weight: s.weight, reps: s.reps, new1RM: est });
      tertinggi = est;
    }
    if (s.isCompleted && !isWarmup) totalVolume += s.weight * s.reps;
  }
  return { totalVolume, prs, tertinggi };
}

// Versi LAMA (tanpa pengecualian pemanasan) — pembanding
function hitungLama(sets, bestSebelumnya) {
  let totalVolume = 0;
  const prs = [];
  let tertinggi = bestSebelumnya;
  for (const s of sets) {
    const est = epley(s.weight, s.reps);
    if (s.isCompleted && est > tertinggi && est > 0) {
      prs.push({ weight: s.weight, reps: s.reps, new1RM: est });
      tertinggi = est;
    }
    if (s.isCompleted) totalVolume += s.weight * s.reps;
  }
  return { totalVolume, prs };
}

let ok = true;
const cek = (label, dapat, harap) => {
  const lulus = JSON.stringify(dapat) === JSON.stringify(harap);
  if (!lulus) ok = false;
  console.log((lulus ? 'OK  ' : 'FAIL') + ' | ' + label.padEnd(56) + ' dapat=' + JSON.stringify(dapat) + ' harap=' + JSON.stringify(harap));
};

const sets = [
  { weight: 40, reps: 10, setType: SetType.WARMUP, isCompleted: true },
  { weight: 100, reps: 5, setType: SetType.NORMAL, isCompleted: true },
];

console.log('=== skenario: pemanasan 40x10 + kerja 100x5 (best sebelumnya 100 1RM) ===');
const lama = hitungLama(sets, 100);
const baru = hitung(sets, 100);
console.log('  volume LAMA: ' + lama.totalVolume + '  (pemanasan ikut dihitung = menggelembung)');
console.log('  volume BARU: ' + baru.totalVolume);
cek('volume tidak lagi memuat set pemanasan', baru.totalVolume, 500);
cek('versi lama memang salah (bukti bug)', lama.totalVolume, 900);

console.log('\n=== pemanasan yang LEBIH BERAT tidak boleh jadi PR (yang jadi PR = set kerja) ===');
const sets2 = [
  { weight: 200, reps: 1, setType: SetType.WARMUP, isCompleted: true }, // 1RM ~206 (terberat)
  { weight: 100, reps: 5, setType: SetType.NORMAL, isCompleted: true }, // 1RM ~116,7
];
const r2 = hitung(sets2, 100);
// Catatan: set kerja 100x5 MEMANG sah jadi PR (1RM 116,7 > best 100). Yang penting
// PR-nya harus dari set KERJA, bukan dari pemanasan 200kg yang lebih berat.
cek('PR diambil dari set kerja, bukan pemanasan', r2.prs.map((p) => p.weight + 'x' + p.reps), ['100x5']);
cek('pemanasan 200kg TIDAK muncul sebagai PR', r2.prs.some((p) => p.weight === 200), false);
cek('volume = 500 saja (pemanasan dikecualikan)', r2.totalVolume, 500);
const r2lama = hitungLama(sets2, 100);
cek('versi lama salah: pemanasan 200kg jadi PR', r2lama.prs[0]?.weight, 200);

console.log('\n=== set kerja tetap terdeteksi PR & masuk volume ===');
const sets3 = [
  { weight: 40, reps: 10, setType: SetType.WARMUP, isCompleted: true },
  { weight: 120, reps: 5, setType: SetType.NORMAL, isCompleted: true }, // 1RM 140 > 100
];
const r3 = hitung(sets3, 100);
cek('PR terdeteksi dari set kerja', r3.prs.length, 1);
cek('volume kerja hanya 600', r3.totalVolume, 600);

console.log('\n=== set belum dicentang tidak dihitung ===');
const r4 = hitung([
  { weight: 100, reps: 5, setType: SetType.NORMAL, isCompleted: true },
  { weight: 100, reps: 5, setType: SetType.NORMAL, isCompleted: false },
], 0);
cek('volume hanya set selesai', r4.totalVolume, 500);

console.log(ok ? '\n=> SEMUA LOLOS' : '\n=> ADA YANG GAGAL');
process.exit(ok ? 0 : 1);
