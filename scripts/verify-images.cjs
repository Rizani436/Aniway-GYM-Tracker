// Verifikasi ISI berkas gambar (bukan cuma status HTTP): harus JPEG/PNG/WebP asli
// dan berukuran wajar. Menangkap kasus CDN membalas 200 tapi isinya halaman error.
const fs = require('fs');
const TMP = process.env.LOCALAPPDATA + '/Temp';
const c = JSON.parse(fs.readFileSync(TMP + '/curated-usable.json', 'utf8'));

(async () => {
  console.log('memeriksa', c.length * 2, 'URL gambar...');
  let ok = 0;
  const bad = [];
  for (let i = 0; i < c.length; i++) {
    for (const u of c[i].images) {
      try {
        const r = await fetch(u, { signal: AbortSignal.timeout(20000) });
        const buf = Buffer.from(await r.arrayBuffer());
        const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
        const isPng = buf[0] === 0x89 && buf[1] === 0x50;
        const isWebp = buf.slice(8, 12).toString() === 'WEBP';
        if (r.status === 200 && (isJpg || isPng || isWebp) && buf.length > 3000) ok++;
        else bad.push(`${u} [status=${r.status} ${buf.length}B jpg=${isJpg} png=${isPng} webp=${isWebp}]`);
      } catch (e) {
        bad.push(`${u} [ERR ${String(e.message).slice(0, 50)}]`);
      }
    }
    if ((i + 1) % 20 === 0) console.log('  ', i + 1, '/', c.length, 'gerakan | gambar valid:', ok);
  }
  console.log('\nGAMBAR VALID:', ok, '| RUSAK:', bad.length);
  bad.forEach((b) => console.log('  x', b));
  fs.writeFileSync(TMP + '/image-check-result.json', JSON.stringify({ ok, bad }, null, 1));
  process.exit(bad.length === 0 ? 0 : 1);
})();
