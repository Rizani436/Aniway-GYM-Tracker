// Buka harness di Chrome headless via CDP, baca window.__results.
const { spawn } = require('child_process');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const TMP = process.env.LOCALAPPDATA + '/Temp/chrome-harness-profile';
const PAGE = 'file:///D:/Project/gym tracker id/.hermes/design/measure-harness.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const child = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${TMP}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--allow-file-access-from-files',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

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

  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(PAGE)}`, { method: 'PUT' })).json();
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE });

  // tunggu sampai harness selesai mengukur
  let val = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    const out = await send('Runtime.evaluate', {
      expression: 'window.__done ? JSON.stringify(window.__results) : null',
      returnByValue: true,
    });
    val = out.result?.result?.value;
    if (val) break;
  }

  if (!val) {
    const dbg = await send('Runtime.evaluate', {
      expression: 'document.getElementById("out").textContent.slice(0,300)',
      returnByValue: true,
    });
    console.error('TIMEOUT. out =', dbg.result?.result?.value);
    ws.close(); child.kill(); process.exit(1);
  }

  console.log(val);
  ws.close();
  child.kill();
  process.exit(0);
})();
