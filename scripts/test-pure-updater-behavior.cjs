// Uji fix "kadang bisa kadang tidak" pada timer istirahat per set.
//
// Kontrak React: updater setState((prev) => ...) HARUS MURNI. React berhak:
//   (A) panggil 1x lalu commit                        -> normal produksi
//   (B) panggil 2x lalu commit (StrictMode dev)       -> efek samping dobel
//   (C) panggil, BUANG hasil pass itu, panggil LAGI,
//       lalu commit hasil pass terakhir               -> render di-replay
//
// Kode LAMA: setActiveRestTimer dipanggil DI DALAM updater -> terpicu sebanyak
// panggilan updater (2x = timer restart/dobel) => "kadang bisa kadang tidak".
// Kode BARU: efek samping DI LUAR updater, diputuskan dari pembacaan ref ->
// tetap 1x per tap centang apa pun perilaku React terhadap updater.

function simulasiReact(scenario) {
  return {
    commit(updater, state) {
      if (scenario === 'A') return updater(state);                    // 1x, commit
      if (scenario === 'B') { updater(state); return updater(state); } // StrictMode 2x, commit pass terakhir
      if (scenario === 'C') { updater(state); return updater(state); } // replay, commit pass terakhir
      throw new Error('skenario tak dikenal: ' + scenario);
    },
  };
}

// ---------- kode LAMA (merekam cacatnya) ----------
function kodeLamaSatuTap(scenario) {
  const react = simulasiReact(scenario);
  let timerFire = 0;
  let state = [{ restSeconds: 90, sets: [{ isCompleted: false }] }];
  state = react.commit((prev) => {
    const next = [...prev];
    const targetEx = { ...next[0] };
    const nextSets = [...targetEx.sets];
    const newStatus = !nextSets[0].isCompleted;
    nextSets[0] = { ...nextSets[0], isCompleted: newStatus };
    targetEx.sets = nextSets;
    next[0] = targetEx;
    if (newStatus) timerFire++;      // <-- EFEK SAMPING DI DALAM UPDATER
    return next;
  }, state);
  return timerFire;
}

// ---------- kode BARU (perilaku hasil perbaikan) ----------
function buatKodeBaru(scenario) {
  const react = simulasiReact(scenario);
  let timerFire = 0;
  let state = [{ restSeconds: 90, sets: [{ isCompleted: false }] }];
  const ref = { current: state };
  return {
    get timerFire() { return timerFire; },
    toggle() {
      const set = ref.current[0]?.sets?.[0];
      if (!set) return;
      const baruSelesai = !set.isCompleted;

      ref.current = react.commit((prev) => {
        const next = [...prev];
        const ex = { ...next[0] };
        const nextSets = [...ex.sets];
        nextSets[0] = { ...nextSets[0], isCompleted: !nextSets[0].isCompleted };
        ex.sets = nextSets;
        next[0] = ex;
        return next;
      }, ref.current);

      if (baruSelesai) timerFire++;    // <-- efek samping DI LUAR, deterministik
    },
  };
}

const NAMA = { A: 'panggil 1x + commit', B: 'StrictMode 2x', C: 'replay: buang lalu commit' };
let semuaLolos = true;
function cek(label, dapat, harap) {
  const lulus = dapat === harap;
  if (!lulus) semuaLolos = false;
  console.log((lulus ? 'OK  ' : 'FAIL') + ' | ' + label.padEnd(48) + ' | dapat=' + String(dapat).padEnd(4) + ' harap=' + harap);
}

console.log('--- KODE LAMA: bukti bug (1 tap centang) ---');
for (const s of ['A', 'B', 'C']) {
  const fire = kodeLamaSatuTap(s);
  console.log('  skenario ' + s + ' (' + NAMA[s] + ') -> timer terpicu ' + fire + 'x');
}
cek('LAMA/StrictMode -> timer dobel (BUG)', kodeLamaSatuTap('B'), 2);
cek('LAMA/replay   -> timer dobel (BUG)', kodeLamaSatuTap('C'), 2);

console.log('\n--- KODE BARU: hasil perbaikan (1 tap centang) ---');
for (const s of ['A', 'B', 'C']) {
  const b = buatKodeBaru(s);
  b.toggle();
  cek('BARU/' + s + ' -> tepat 1x', b.timerFire, 1);
}

console.log('\n--- KODE BARU: kasus lanjutan ---');
{
  const b = buatKodeBaru('B');
  b.toggle();  // centang -> picu
  b.toggle();  // buka centang -> jangan picu
  cek('buka-centang tidak memicu timer', b.timerFire, 1);
}
{
  const b = buatKodeBaru('B');
  b.toggle(); b.toggle(); b.toggle();  // centang, buka, centang
  cek('centang-buka-centang = 2x', b.timerFire, 2);
}
{
  // 6 tap (genap): 3 centang + 3 buka-centang => 3x picu, sama di ketiga skenario
  const hasil = ['A', 'B', 'C'].map((s) => {
    const b = buatKodeBaru(s);
    for (let i = 0; i < 6; i++) b.toggle();
    return b.timerFire;
  });
  cek('6 tap konsisten lintas skenario', hasil.join(','), '3,3,3');
}

console.log(semuaLolos ? '\n=> SEMUA LOLOS' : '\n=> ADA YANG GAGAL');
process.exit(semuaLolos ? 0 : 1);
