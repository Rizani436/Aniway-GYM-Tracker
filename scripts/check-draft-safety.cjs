/**
 * GUARD: draft sesi latihan tidak boleh dihapus di jalur inisialisasi.
 *
 * Kenapa: dulu blok init di workout-runner.tsx memanggil
 * `localStorage.removeItem(storageKey)` saat programId di URL berbeda dari
 * draft. Akibatnya isi sesi yang sudah diisi lalu ditinggal hilang tanpa
 * peringatan (auto-save menimpa draft dengan state kosong). Pemghapusan draft
 * hanya sah dari aksi eksplisit user:
 *   - handleDiscardDraft  ("Sesi Baru" / "Hapus" / "Ganti")
 *   - handleFinishWorkout ("Selesai" -> sesi sudah tersimpan)
 *
 * Jalankan: node scripts/check-draft-safety.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'components', 'workout', 'workout-runner.tsx');
const src = fs.readFileSync(FILE, 'utf8');

// Batasi pemeriksaan ke effect inisialisasi (dari penanda sampai useEffect berikutnya).
const start = src.indexOf('// Check LocalStorage Draft on Mount');
if (start === -1) {
  console.error('GAGAL: penanda "Check LocalStorage Draft on Mount" tidak ditemukan — guard perlu diperbarui.');
  process.exit(1);
}
const rest = src.slice(start);
const nextEffect = rest.indexOf('\n  // ', 10); // awal blok useEffect berikutnya
const initBlock = rest.slice(0, nextEffect === -1 ? rest.length : nextEffect);

const offenders = initBlock
  .split('\n')
  .map((line, i) => ({ line: line.trim(), no: i + 1 }))
  .filter(({ line }) => /removeItem\s*\(/.test(line) && !/^\s*(\/\/|\*)/.test(line));

if (offenders.length > 0) {
  console.error('GAGAL: penghapusan draft di jalur inisialisasi (data sesi bisa hilang):');
  offenders.forEach((o) => console.error(`  baris ${o.no}: ${o.line}`));
  process.exit(1);
}

// Pembersihan yang sah harus tetap ada, kalau tidak sesi akan terus "hidup".
// `handleDiscardDraft` -> tombol Sesi Baru/Hapus; `handleFinishWorkout` -> Selesai.
const required = ['handleDiscardDraft', 'handleFinishWorkout'];
const missing = required.filter((fn) => {
  const idx = src.indexOf(fn);
  if (idx === -1) return true;
  // Cari sampai fungsi berikutnya (bukan jarak karakter tetap: handleFinishWorkout panjang).
  const after = src.slice(idx);
  const end = after.search(/\n  const handle[A-Z]|\n  \/\/ Format Timer/);
  const body = end === -1 ? after : after.slice(0, end);
  return !/removeItem\s*\(storageKey\)/.test(body);
});
if (missing.length > 0) {
  console.error('GAGAL: fungsi wajib tanpa pembersihan draft: ' + missing.join(', '));
  process.exit(1);
}

// Jalur init HARUS memakai planner bersama (bukan logika sendiri-sendiri).
// Kalau sambungan ini hilang, perilaku resume kembali tidak konsisten.
const wiring = [
  { name: 'planDraftLoad', re: /planDraftLoad\s*\(/ },
  { name: 'applyDraft', re: /applyDraft\s*\(/ },
  { name: 'parseWorkoutDraft', re: /parseWorkoutDraft\s*\(/ },
];
const unwired = wiring.filter(({ re }) => !re.test(initBlock)).map((w) => w.name);
if (unwired.length > 0) {
  console.error('GAGAL: jalur init tidak memakai: ' + unwired.join(', '));
  process.exit(1);
}

// Auto-save harus menghormati keputusan draft yang belum diambil.
if (!/draftDecision === 'pending'/.test(src)) {
  console.error("GAGAL: auto-save tidak menahan diri saat draftDecision === 'pending' (draft lama bisa tertimpa).");
  process.exit(1);
}

console.log('OK: tidak ada penghapusan draft di jalur init; pembersihan hanya lewat aksi user.');
