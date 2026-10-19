// Diagnostik: apakah service worker BENAR-BENAR menangani navigasi offline?
// Trik: kosongkan halaman dulu (about:blank), supaya kalau navigasi gagal kita
// melihat halaman kosong — bukan sisa halaman lama yang menyesatkan.
const { spawn } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9557;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const child = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.LOCALAPPDATA}/Temp/chrome-diag-offline`,
    '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank',
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); if (ver.webSocketDebuggerUrl) break; } catch {} await sleep(250); }
  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (m, p = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await sleep(5000);
  console.log('SW control:', await js(`!!navigator.serviceWorker.controller`));
  console.log('cache v3  :', JSON.stringify(await js(`caches.keys()`)));

  // Kosongkan halaman supaya hasil navigasi tidak tertukar dengan halaman lama
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(800);
  console.log('sebelum offline -> url:', await js(`location.href`));

  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await send('Page.navigate', { url: 'http://localhost:3000/workout' });
  await sleep(4000);

  console.log('\n--- setelah navigasi OFFLINE ke /workout ---');
  console.log('url      :', await js(`location.href`));
  console.log('title    :', await js(`document.title`));
  const body = await js(`document.body ? document.body.innerText.slice(0,120) : '(tanpa body)'`);
  console.log('body     :', JSON.stringify(String(body)));
  console.log('ada teks offline  :', await js(`document.body ? document.body.innerText.includes('sedang offline') : false`));
  console.log('ada teks login    :', await js(`document.body ? (document.body.innerText.includes('Daftar Baru')) : false`));
  console.log('SW masih control  :', await js(`!!navigator.serviceWorker.controller`));
  console.log('jenis navigasi    :', await js(`(performance.getEntriesByType('navigation')[0]||{}).type`));
  console.log('dari service worker:', await js(`(performance.getEntriesByType('navigation')[0]||{}).workerStart > 0`));

  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  ws.close(); child.kill(); process.exit(0);
})();
