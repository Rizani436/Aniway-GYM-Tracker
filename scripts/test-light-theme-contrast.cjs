// A2: verifikasi nyata override kontras tema terang via headless Chrome + CDP.
// Fixture = halaman statis kecil dengan kelas aksen; diukur computed color
// saat .dark (harus tetap terang) dan saat tanpa .dark (harus jadi versi gelap).
// Server produksi lokal harus jalan di port 3000.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9561;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fixture disajikan lewat data: URL + CSS app via <link>. Lebih sederhana:
// pakai halaman login app (publik, tanpa auth) lalu injeksikan elemen uji.
const ORIGIN = 'http://localhost:3000';

(async () => {
  const child = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.LOCALAPPDATA}/Temp/chrome-light-test`,
    '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank',
  ], { stdio: 'ignore' });

  let ver = null;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      ver = await r.json();
      if (ver.webSocketDebuggerUrl) break;
    } catch {}
    await sleep(250);
  }
  if (!ver) { console.error('DevTools tidak siap'); child.kill(); process.exit(1); }

  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(ORIGIN + '/login')}`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (method, params = {}) =>
    new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJS = async (expr) =>
    (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(2500);

  // Injeksikan elemen dengan kelas aksen + CSS app, ukur computed color
  // dalam dua mode: dark (html.dark) dan light (class dihapus).
  const hasil = await evalJS(`(() => {
    const div = document.createElement('div');
    div.id = 'uji-aksen';
    div.innerHTML = '<span class="text-emerald-400">e4</span><span class="text-amber-300">a3</span><span class="text-sky-300">s3</span><span class="text-rose-400">r4</span>';
    div.style.cssText = 'position:fixed;top:0;left:0;background:#f7f8f8;padding:8px;z-index:9999';
    document.body.appendChild(div);
    const ambil = () => [...div.querySelectorAll('span')].map(s => getComputedStyle(s).color);
    const dark = ambil();                       // app default: html.dark
    document.documentElement.classList.remove('dark');
    const light = ambil();                      // tema terang
    document.documentElement.classList.add('dark');
    div.remove();
    return { dark, light };
  })()`);

  const HARAP_LIGHT = ['rgb(4, 120, 87)', 'rgb(180, 83, 9)', 'rgb(3, 105, 161)', 'rgb(190, 18, 60)'];
  const EMERALD_400_DARK = 'rgb(52, 211, 153)';

  console.log('dark :', JSON.stringify(hasil.dark));
  console.log('light:', JSON.stringify(hasil.light));

  const darkTetap = hasil.dark[0] === EMERALD_400_DARK;
  const lightOverride = HARAP_LIGHT.every((c, i) => hasil.light[i] === c);

  console.log('mode gelap tak berubah      :', darkTetap ? 'OK' : 'GAGAL');
  console.log('mode terang pakai warna gelap:', lightOverride ? 'OK' : 'GAGAL');

  ws.close(); child.kill();
  const lulus = darkTetap && lightOverride;
  console.log(lulus ? '=> OVERRIDE KONTRAS TERANG BEKERJA ✓' : '=> OVERRIDE TIDAK JALAN ✗');
  process.exit(lulus ? 0 : 1);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
