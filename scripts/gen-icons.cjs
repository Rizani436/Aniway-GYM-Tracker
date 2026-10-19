// scripts/gen-icons.cjs — generate ikon PWA. Jalankan: node scripts/gen-icons.cjs
const sharp = require('sharp');
const fs = require('fs');

// Dumbbell proporsional: 2 plat luar, 2 plat dalam, 1 bar.
// `pad` = ruang aman (maskable butuh konten di dalam 80% tengah).
function svgDumbbell(size, pad = 0.12) {
  const P = size * pad;                 // padding
  const W = size - P * 2;               // lebar area gambar
  const cy = size / 2;
  const barH = W * 0.10;
  const outerH = W * 0.50, outerW = W * 0.11;
  const innerH = W * 0.32, innerW = W * 0.09;
  const cy1 = size * 0.5 + W * 0.155;   // plat luar (kiri & kanan)
  const cy2 = size * 0.5 + W * 0.225;   // plat dalam (kiri & kanan)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#08090a"/>
  <rect x="${size*0.5}" y="${size*0.5}" width="${W}" height="${barH}" rx="${barH/2}"
        transform="translate(-${W/2},-${barH/2})" fill="#10b981"/>
  <rect x="${P}" y="${cy - outerH/2}" width="${outerW}" height="${outerH}" rx="${outerW*0.35}" fill="#10b981"/>
  <rect x="${size - P - outerW}" y="${cy - outerH/2}" width="${outerW}" height="${outerH}" rx="${outerW*0.35}" fill="#10b981"/>
  <rect x="${P + outerW + W*0.03}" y="${cy - innerH/2}" width="${innerW}" height="${innerH}" rx="${innerW*0.35}" fill="#059669"/>
  <rect x="${size - P - outerW - W*0.03 - innerW}" y="${cy - innerH/2}" width="${innerW}" height="${innerH}" rx="${innerW*0.35}" fill="#059669"/>
</svg>`;
}

const targets = [
  { file: 'public/icon-192.png', size: 192, pad: 0.14 },
  { file: 'public/icon-512.png', size: 512, pad: 0.14 },
  // maskable: konten lebih kecil agar aman saat dipotong bentuk bulat/squircle
  { file: 'public/icon-maskable-512.png', size: 512, pad: 0.24 },
  { file: 'public/apple-touch-icon.png', size: 180, pad: 0.14 },
];

(async () => {
  for (const t of targets) {
    await sharp(Buffer.from(svgDumbbell(t.size, t.pad)))
      .png({ compressionLevel: 9 })
      .toFile(t.file);
    const st = fs.statSync(t.file);
    console.log(`${t.file}  ${st.size} bytes`);
  }
})();
