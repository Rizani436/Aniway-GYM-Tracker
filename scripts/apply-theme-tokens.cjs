/**
 * Migrasi warna hardcode -> token tema (sekali jalan, idempoten-ish).
 *
 * Membaca semua file .tsx/.ts di src/ dan mengganti kelas warna gelap yang
 * hardcode dengan token CSS (`var(--bg)`, dst). globals.css (definisi token)
 * sengaja tidak tersentuh karena ekstensinya .css.
 *
 * Daftar penggantian DIURUTKAN: varian dengan /opacity didahulukan agar tidak
 * tertangkap oleh token dasarnya terlebih dahulu.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

const REPLACEMENTS = [
  // ---- hex ----
  ['bg-[#08090a]/95', 'bg-[var(--bg)]'],
  ['bg-[#08090a]', 'bg-[var(--bg)]'],
  ['text-[#f7f8f8]', 'text-[var(--fg)]'],
  ['bg-[#0f1011]/95', 'bg-[var(--bg-soft)]'],
  ['bg-[#0f1011]/90', 'bg-[var(--bg-soft)]'],
  ['bg-[#0f1011]', 'bg-[var(--bg-soft)]'],
  ['bg-[#121314]', 'bg-[var(--surface)]'],
  ['bg-[#101113]', 'bg-[var(--surface)]'],
  // ---- zinc backgrounds (slash variant dulu) ----
  ['bg-zinc-950/70', 'bg-[var(--bg)]'],
  ['bg-zinc-950', 'bg-[var(--bg)]'],
  ['bg-zinc-900/80', 'bg-[var(--surface)]'],
  ['bg-zinc-900', 'bg-[var(--surface)]'],
  ['bg-zinc-850', 'bg-[var(--surface-2)]'],
  ['bg-zinc-800/70', 'bg-[var(--surface-2)]'],
  ['bg-zinc-800', 'bg-[var(--surface-2)]'],
  ['bg-zinc-700', 'bg-[var(--surface-3)]'],
  // ---- zinc borders/dividers ----
  ['border-zinc-800/80', 'border-[var(--border)]'],
  ['border-zinc-800/40', 'border-[var(--border)]'],
  ['border-zinc-800', 'border-[var(--border)]'],
  ['border-zinc-700', 'border-[var(--border)]'],
  ['divide-zinc-800/40', 'divide-[var(--border)]'],
  ['divide-zinc-800', 'divide-[var(--border)]'],
  // ---- input inset ----
  ['bg-black/40', 'bg-[var(--input)]'],
  // ---- glass surfaces (white/opacity) ----
  ['bg-white/[0.14]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.12]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.1]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.08]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.07]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.06]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.05]', 'bg-[var(--card-hover)]'],
  ['bg-white/[0.04]', 'bg-[var(--card)]'],
  ['bg-white/[0.03]', 'bg-[var(--card)]'],
  ['bg-white/[0.02]', 'bg-[var(--card)]'],
  // ---- white borders ----
  ['border-white/[0.25]', 'border-[var(--border-strong)]'],
  ['border-white/[0.15]', 'border-[var(--border-strong)]'],
  ['border-white/[0.14]', 'border-[var(--border-strong)]'],
  ['border-white/[0.12]', 'border-[var(--border)]'],
  ['border-white/[0.10]', 'border-[var(--border)]'],
  ['border-white/[0.1]', 'border-[var(--border)]'],
  ['border-white/[0.08]', 'border-[var(--border)]'],
  ['border-white/[0.07]', 'border-[var(--border)]'],
  ['border-white/[0.06]', 'border-[var(--border)]'],
  ['border-white/[0.05]', 'border-[var(--border)]'],
  // ---- text ----
  ['text-zinc-700', 'text-[var(--muted-strong)]'],
  ['text-zinc-600', 'text-[var(--muted-strong)]'],
  ['text-zinc-500', 'text-[var(--muted-strong)]'],
  ['text-zinc-400', 'text-[var(--muted)]'],
  ['text-zinc-300', 'text-[var(--fg-soft)]'],
  ['text-zinc-200', 'text-[var(--fg-strong)]'],
  ['text-zinc-100', 'text-[var(--fg-strong)]'],
  ['text-white', 'text-[var(--fg)]'],
  ['placeholder-zinc-600', 'placeholder-[var(--muted-strong)]'],
  ['placeholder-zinc-500', 'placeholder-[var(--muted-strong)]'],
  ['placeholder-zinc-400', 'placeholder-[var(--muted)]'],
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Path ber-kurung siku ([id]) ditangani manual lewat tool edit — sandbox
    // DSH menolak write file lewat Node untuk path semacam itu.
    if (entry.name.includes('[') || entry.name.includes(']')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(tsx|ts)$/.test(entry.name)) yield full;
  }
}

let changedFiles = 0;
let totalChanges = 0;

for (const file of walk(SRC)) {
  const original = fs.readFileSync(file, 'utf8');
  let content = original;
  let fileChanges = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (!content.includes(from)) continue;
    const before = content;
    content = content.split(from).join(to);
    // hitung kasar jumlah kemunculan yang diganti
    fileChanges += before.split(from).length - 1;
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    totalChanges += fileChanges;
    console.log(`[ok] ${path.relative(SRC, file)} (+${fileChanges})`);
  }
}

console.log(`\nSelesai: ${changedFiles} file, ${totalChanges} penggantian.`);
