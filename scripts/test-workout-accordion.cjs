// Uji logika akordeon — replika persis dari workout-runner.tsx
function computeOpen(exercises, openCardIdx) {
  const autoOpenCardIdx = exercises.findIndex((ex) => ex.sets.some((s) => !s.isCompleted));
  return openCardIdx === null
    ? (autoOpenCardIdx >= 0 ? autoOpenCardIdx : null)
    : openCardIdx;
}
function toggle(exercises, openCardIdx, idx) {
  const cur = computeOpen(exercises, openCardIdx);
  return cur === idx ? -1 : idx;
}

const mk = (name, statuses) => ({ name, sets: statuses.map((c) => ({ isCompleted: c })) });
const pass = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log((ok ? 'OK  ' : 'FAIL') + ' | ' + label + ' | dapat=' + JSON.stringify(got) + ' harap=' + JSON.stringify(want));
  return ok;
};

let results = [];

// 1. Program 5 gerakan, baru mulai -> kartu 0 terbuka
let ex = [mk('A', [false, false, false]), mk('B', [false]), mk('C', [false]), mk('D', [false]), mk('E', [false])];
results.push(pass('baru mulai -> kartu 0', computeOpen(ex, null), 0));

// 2. Selesai semua set A -> pindah otomatis ke B (kartu 1)
ex[0].sets = [{ isCompleted: true }, { isCompleted: true }, { isCompleted: true }];
results.push(pass('A tuntas -> otomatis ke B', computeOpen(ex, null), 1));

// 3. B tuntas juga -> ke C
ex[1].sets = [{ isCompleted: true }];
results.push(pass('B tuntas -> otomatis ke C', computeOpen(ex, null), 2));

// 4. Semua gerakan tuntas -> tak ada yang terbuka otomatis
const allDone = ex.map((e) => ({ ...e, sets: e.sets.map(() => ({ isCompleted: true })) }));
results.push(pass('semua tuntas -> null', computeOpen(allDone, null), null));

// 5. User buka manual kartu 4 -> menang atas otomatis
results.push(pass('buka manual kartu 4', computeOpen(ex, 4), 4));

// 6. Tap kartu yang sedang terbuka -> tertutup (mode -1)
results.push(pass('tap kartu terbuka -> tutup', toggle(ex, 4, 4), -1));

// 7. Setelah -1, sistem TIDAK membuka ulang otomatis (tidak mengganggu)
results.push(pass('setelah tutup manual -> tetap tertutup', computeOpen(ex, -1), -1));

// 8. Dari -1, tap kartu 2 -> buka kartu 2
results.push(pass('dari tertutup, tap kartu 2', computeOpen(ex, toggle(ex, -1, 2)), 2));

const okAll = results.every(Boolean);
console.log(okAll ? '\n=> SEMUA LOLOS (' + results.length + ' kasus)' : '\n=> ADA YANG GAGAL');
process.exit(okAll ? 0 : 1);
