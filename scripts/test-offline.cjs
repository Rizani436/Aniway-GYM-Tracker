// Uji offline SEJATI — tanpa emulasi.
//
// Kenapa: `Network.emulateNetworkConditions` CDP TIDAK andal untuk service worker
// (SW tetap bisa mengambil data / respons tersimpan sebagai status 0). Jadi uji ini
// MEMATIKAN server sungguhan, lalu membuktikan halaman tetap terbuka.
//
// Alur:
//   1. server hidup  -> buka /login & /workout (SW terpasang, cache terisi)
//   2. MATIKAN server (kill proses di port 3000)
//   3. muat ulang /workout -> HARUS tetap terbuka dari cache, bukan halaman login
//   4. nyalakan server lagi
//
// Prasyarat: production build (`npx next build`), server di port 3000.
const { spawn, execSync } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9556;
const ORIGIN = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function killPort3000() {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const line = out.split('\n').find((l) => l.includes(':3000') && l.includes('LISTENING'));
    if (!line) return null;
    const pid = line.trim().split(/\s+/).pop();
    execSync(`MSYS_NO_PATHCONV=1 taskkill /F /PID ${pid}`, { stdio: 'ignore', shell: 'bash' });
    return pid;
  } catch {
    return null;
  }
}

(async () => {
  const child = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.LOCALAPPDATA}/Temp/chrome-offline-real`,
    '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank',
  ], { stdio: 'ignore' });

  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); if (ver.webSocketDebuggerUrl) break; } catch {} await sleep(250); }
  if (!ver) { console.error('devtools tidak siap'); child.kill(); process.exit(1); }

  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (m, p = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async (e) => {
    const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true, timeout: 20000 });
    if (r.result?.exceptionDetails) return `__ERROR__ ${r.result.exceptionDetails.text}`;
    return r.result?.result?.value;
  };

  await send('Page.enable'); await send('Runtime.enable');

  // 1) Fase online: pasang SW + isi cache
  await send('Page.navigate', { url: `${ORIGIN}/login` });
  await sleep(5000);
  console.log('SW ready  :', await js(`navigator.serviceWorker.ready.then(()=>'READY').catch(e=>'GAGAL')`));
  console.log('SW kontrol:', await js(`!!navigator.serviceWorker.controller ? 'AKTIF' : 'BELUM'`));

  await send('Page.navigate', { url: `${ORIGIN}/workout` });
  await sleep(4000);
  console.log('online /workout -> url:', await js(`location.pathname`));

  const isiCache = await js(`(async () => {
    const ks = await caches.keys();
    const shell = ks.find(k => k.includes('shell'));
    if (!shell) return { kunci: [], adaLoginDisimpan: false };
    const c = await caches.open(shell);
    const reqs = await c.keys();
    let adaLoginDisimpan = false;
    for (const r of reqs) {
      const res = await c.match(r);
      if (!res) continue;
      const t = (await res.text()).slice(0, 400);
      if (t.includes('Daftar Baru')) adaLoginDisimpan = true;
    }
    return { kunci: reqs.map(r => new URL(r.url).pathname), adaLoginDisimpan };
  })()`);
  console.log('cache shell:', JSON.stringify(isiCache));

  // 2) MATIKAN SERVER (offline sungguhan)
  const killed = killPort3000();
  console.log('\nserver dimatikan (pid ' + killed + ')');
  await sleep(2500);
  const masihHidup = await fetch(`${ORIGIN}/login`, { signal: AbortSignal.timeout(3000) }).then(() => true).catch(() => false);
  console.log('server benar-benar mati:', masihHidup ? 'TIDAK (masih balas)' : 'YA');

  // 3) Muat ulang /workout dengan server mati
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(500);
  await send('Page.navigate', { url: `${ORIGIN}/workout` });
  await sleep(5000);

  const body = String(await js(`document.body ? document.body.innerText.slice(0, 300) : '(tanpa body)'`));
  const urlAkhir = await js(`location.pathname`);
  const dariSW = await js(`(performance.getEntriesByType('navigation')[0]||{}).workerStart > 0`);

  console.log('\n--- /workout dengan SERVER MATI ---');
  console.log('url               :', urlAkhir);
  console.log('ditangani SW      :', dariSW);
  console.log('ada teks offline  :', body.includes('sedang offline'));
  console.log('ada teks login    :', body.includes('Daftar Baru'));
  console.log('body              :', JSON.stringify(body.slice(0, 140)));

  // 4) Nyalakan server lagi (biar lingkungan siap untuk fase berikutnya)
  try {
    execSync(`cd "/d/Project/gym tracker id" && (npx next start -p 3000 > /dev/null 2>&1 &)`, { stdio: 'ignore', shell: 'bash' });
  } catch {}
  ws.close(); child.kill();

  const lulus = urlAkhir === '/workout' && !body.includes('Daftar Baru') && body.length > 40;
  console.log('\n--- penilaian ---');
  console.log('/workout tetap di /workout :', urlAkhir === '/workout' ? 'YA' : 'TIDAK (' + urlAkhir + ')');
  console.log('tidak dilempar ke login    :', !body.includes('Daftar Baru') ? 'YA' : 'TIDAK');
  console.log('halaman punya isi          :', body.length > 40 ? 'YA' : 'TIDAK');
  console.log(lulus ? '=> OFFLINE BEKERJA ✓' : '=> MASIH GAGAL OFFLINE ✗');
  process.exit(lulus ? 0 : 1);
})();
