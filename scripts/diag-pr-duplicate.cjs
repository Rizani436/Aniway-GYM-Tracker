// Apakah satu sesi bisa menandai BEBERAPA set sebagai PR untuk gerakan yang SAMA?
//
// Logika produksi memakai `highestSet1RMInSession` yang DIPERBARUI setiap kali
// sebuah set jadi PR. Artinya perbandingan set berikutnya bukan lagi melawan
// rekor SEUMUR LATIHAN, melainkan melawan set terbaik di sesi ini juga.
// Akibatnya dua set dalam satu sesi bisa dua-duanya ditandai PR, dan banner
// perayaan di ringkasan bisa muncul dobel untuk gerakan yang sama.
// Hanya BACA — replika logika, tanpa menyentuh DB.
const SetType = { WARMUP: 'WARMUP', NORMAL: 'NORMAL' };
const epley = (w, r) => (w > 0 && r > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0);

function deteksi(sets, bestSeumurLatihan) {
  const prs = [];
  let tertinggi = bestSeumurLatihan;
  for (const s of sets) {
    const est = epley(s.weight, s.reps);
    if (s.setType !== SetType.WARMUP && s.isCompleted && est > tertinggi && est > 0) {
      prs.push({ weight: s.weight, reps: s.reps, new1RM: est, previousBest: tertinggi });
      tertinggi = est;
    }
  }
  return prs;
}

const kasus = [
  { label: 'satu set memecahkan rekor', sets: [
      { weight: 100, reps: 5, setType: SetType.NORMAL, isCompleted: true }], best: 100 },
  { label: 'dua set menanjak, keduanya lewat rekor lama', sets: [
      { weight: 105, reps: 5, setType: SetType.NORMAL, isCompleted: true },
      { weight: 110, reps: 5, setType: SetType.NORMAL, isCompleted: true }], best: 100 },
  { label: 'tiga set menanjak', sets: [
      { weight: 105, reps: 5, setType: SetType.NORMAL, isCompleted: true },
      { weight: 110, reps: 5, setType: SetType.NORMAL, isCompleted: true },
      { weight: 115, reps: 5, setType: SetType.NORMAL, isCompleted: true }], best: 100 },
];

console.log('=== perilaku SEKARANG (running max) ===');
let adaMasalah = false;
for (const k of kasus) {
  const prs = deteksi(k.sets, k.best);
  console.log('\n' + k.label);
  console.log('  jumlah PR dilaporkan: ' + prs.length);
  for (const p of prs) console.log('    ' + p.weight + 'kg x ' + p.reps + ' -> 1RM ' + p.new1RM + ' (dibanding ' + p.previousBest + ')');
  if (prs.length > 1) {
    adaMasalah = true;
    console.log('  ^^ GANDA: satu gerakan, satu sesi, ' + prs.length + ' banner PR');
  }
}

console.log('\n' + (adaMasalah ? '=> TERBUKTI: PR bisa ganda dalam satu sesi' : '=> tidak ada ganda'));
console.log('\nYang seharusnya: satu PR per gerakan per sesi = set dengan 1RM TERTINGGI.');
