// Uji aturan PR: SATU per gerakan per sesi (set kerja dengan 1RM tertinggi).
//
// Membuktikan dua arah: aturan BARU menghasilkan 1 PR, dan aturan LAMA (running
// max) menghasilkan banyak PR untuk gerakan yang sama — jadi perubahannya nyata.
const SetType = { WARMUP: 'WARMUP', NORMAL: 'NORMAL', DROPSET: 'DROPSET' };
const epley = (w, r) => (w > 0 && r > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0);

// Aturan BARU — replika persis workout-actions.ts
function deteksiBaru(sets, bestSeumurLatihan) {
  const setKerja = sets
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.isCompleted && s.setType !== SetType.WARMUP && s.weight > 0 && s.reps > 0)
    .map(({ s, i }) => ({ i, est: epley(s.weight, s.reps) }));

  const maxEst = setKerja.length ? Math.max(...setKerja.map((x) => x.est)) : 0;
  const idxPR = setKerja.length && maxEst > bestSeumurLatihan ? setKerja.find((x) => x.est === maxEst).i : -1;

  return {
    prs: idxPR >= 0 ? [{ i: idxPR, weight: sets[idxPR].weight, reps: sets[idxPR].reps, new1RM: maxEst, previousBest: bestSeumurLatihan }] : [],
    flags: sets.map((_, i) => i === idxPR),
  };
}

// Aturan LAMA (running max) — pembanding
function deteksiLama(sets, bestSeumurLatihan) {
  const prs = [];
  let tertinggi = bestSeumurLatihan;
  const flags = sets.map((s) => {
    const est = epley(s.weight, s.reps);
    const isPR = s.setType !== SetType.WARMUP && s.isCompleted && est > tertinggi && est > 0;
    if (isPR) { prs.push({ weight: s.weight, reps: s.reps, new1RM: est }); tertinggi = est; }
    return isPR;
  });
  return { prs, flags };
}

let ok = true;
const cek = (label, dapat, harap) => {
  const lulus = JSON.stringify(dapat) === JSON.stringify(harap);
  if (!lulus) ok = false;
  console.log((lulus ? 'OK  ' : 'FAIL') + ' | ' + label.padEnd(58) + ' dapat=' + JSON.stringify(dapat) + ' harap=' + JSON.stringify(harap));
};

const N = (w, r) => ({ weight: w, reps: r, setType: SetType.NORMAL, isCompleted: true });
const W = (w, r) => ({ weight: w, reps: r, setType: SetType.WARMUP, isCompleted: true });

console.log('=== 1. tiga set menanjak, semua lewat rekor lama (best 100) ===');
{
  const sets = [N(105, 5), N(110, 5), N(115, 5)];
  const baru = deteksiBaru(sets, 100);
  const lama = deteksiLama(sets, 100);
  console.log('  LAMA: ' + lama.prs.length + ' PR   BARU: ' + baru.prs.length + ' PR');
  cek('aturan baru -> tepat 1 PR', baru.prs.length, 1);
  cek('PR diambil dari set tertinggi (115kg)', baru.prs[0].weight, 115);
  cek('hanya set tertinggi yang ditandai', baru.flags, [false, false, true]);
  cek('bukti bug lama: 3 PR untuk satu gerakan', lama.prs.length, 3);
}

console.log('\n=== 2. set pemanasan tidak pernah jadi PR ===');
{
  const sets = [W(200, 1), N(100, 5)];
  const baru = deteksiBaru(sets, 100);
  cek('pemanasan 200kg tidak ditandai', baru.flags, [false, true]);
  cek('PR = set kerja 100kg', baru.prs[0].weight, 100);
}

console.log('\n=== 3. tidak ada PR bila tidak melebihi rekor seumur latihan ===');
{
  const sets = [N(90, 5), N(95, 5)];
  const baru = deteksiBaru(sets, 200);
  cek('tanpa PR', baru.prs.length, 0);
  cek('tidak ada set ditandai', baru.flags, [false, false]);
}

console.log('\n=== 4. set belum dicentang tidak dihitung ===');
{
  const sets = [N(150, 5), { weight: 300, reps: 5, setType: SetType.NORMAL, isCompleted: false }];
  const baru = deteksiBaru(sets, 100);
  cek('yang jadi PR set yang selesai', baru.prs[0].weight, 150);
  cek('set belum selesai tak ditandai', baru.flags, [true, false]);
}

console.log('\n=== 5. set reps 0 / beban 0 diabaikan ===');
{
  const sets = [N(0, 5), N(100, 0), N(120, 5)];
  const baru = deteksiBaru(sets, 100);
  cek('hanya set valid yang jadi PR', baru.prs[0].weight, 120);
  cek('flags benar', baru.flags, [false, false, true]);
}

console.log('\n=== 6. beberapa gerakan: satu PR masing-masing ===');
{
  const perGerakan = [
    { nama: 'A', sets: [N(105, 5), N(110, 5)], best: 100 },
    { nama: 'B', sets: [N(60, 8), N(65, 8)], best: 50 },
  ];
  const hasil = perGerakan.map((g) => deteksiBaru(g.sets, g.best).prs.length);
  cek('tiap gerakan 1 PR (total 2)', hasil, [1, 1]);
}

console.log('\n' + (ok ? '=> SEMUA LOLOS' : '=> ADA YANG GAGAL'));
process.exit(ok ? 0 : 1);
