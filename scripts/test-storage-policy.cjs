// Uji BEHAVIOR policy — tiap skenario di TRANSAKSI TERPISAH supaya error satu
// skenario tidak membatalkan skenario lain (aborted transaction).
// Tidak ada tulisan permanen: tiap transaksi diakhiri dengan throw → ROLLBACK.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UID = '8b96db05-c5cf-4a2c-814f-e6cf30887603';
const UID_LAIN = '99999999-0000-0000-0000-000000000000';

// Jalankan 1 skenario dalam transaksinya sendiri. return 'ok' | 'tolak'
async function skenario({ uid, folder, role, claims }) {
  let hasil = null;
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`);
        if (claims) {
          await tx.$executeRawUnsafe(
            `SELECT set_config('request.jwt.claims', $1, true)`,
            JSON.stringify(claims)
          );
        }
        try {
          await tx.$executeRawUnsafe(
            `INSERT INTO storage.objects (bucket_id, name, owner, version)
             VALUES ('exercise-images', $1, $2::uuid, '1')`,
            `${folder}/1750000000000.jpg`,
            uid
          );
          hasil = 'ok';
        } catch (e) {
          const m = (String(e.message).match(/Message: `([^`]*)`/) || [, ''])[1];
          hasil = m.includes('row-level security') ? 'tolak-rls' : 'tolak-lain';
          hasil_pesan = m.replace(/\s+/g, ' ').slice(0, 78);
        }
        throw new Error('__ROLLBACK__');
      },
      { timeout: 20000 }
    );
  } catch (e) {
    if (e.message !== '__ROLLBACK__' && hasil === null) {
      const m = (String(e.message).match(/Message: `([^`]*)`/) || [, String(e.message)])[1];
      hasil = 'gagal-transaksi';
      hasil_pesan = m.replace(/\s+/g, ' ').slice(0, 78);
    }
  }
  return hasil;
}

let hasil_pesan = '';
let pesanTerakhir = {};
const label = {
  a: 'A. login, folder = uid SENDIRI',
  b: 'B. login, folder = uid ORANG LAIN',
  c: 'C. anon (belum login)',
  d: 'D. login tapi tanpa klaim sub',
};

(async () => {
  const sk = [
    ['a', { uid: UID, folder: UID, role: 'authenticated', claims: { sub: UID, role: 'authenticated' } }],
    ['b', { uid: UID, folder: UID_LAIN, role: 'authenticated', claims: { sub: UID, role: 'authenticated' } }],
    ['c', { uid: UID, folder: UID, role: 'anon', claims: { sub: UID, role: 'anon' } }],
    ['d', { uid: UID, folder: UID, role: 'authenticated', claims: {} }],
  ];
  const hasil = {};
  for (const [k, cfg] of sk) {
    hasil[k] = await skenario(cfg);
    pesanTerakhir[k] = hasil_pesan;
    const tanda = hasil[k] === 'ok' ? 'BERHASIL (diizinkan)' : `DITOLAK [${hasil[k]}]`;
    console.log(`  ${label[k].padEnd(36)} -> ${tanda}`);
    if (hasil[k] !== 'ok') console.log(`      pesan: ${pesanTerakhir[k]}`);
  }

  const sisa = await prisma.$queryRawUnsafe(
    `SELECT count(*)::int AS n FROM storage.objects WHERE bucket_id='exercise-images'`
  );
  console.log('\nsisa objek setelah rollback:', sisa[0].n, sisa[0].n === 0 ? '(bersih ✓)' : '(ADA SISA ✗)');
  console.log('diharapkan: A=BERHASIL, B/C/D=DITOLAK');

  const lulus =
    hasil.a === 'ok' &&
    ['tolak-rls', 'tolak-lain', 'gagal-transaksi'].includes(hasil.b) &&
    ['tolak-rls', 'tolak-lain', 'gagal-transaksi'].includes(hasil.c) &&
    ['tolak-rls', 'tolak-lain', 'gagal-transaksi'].includes(hasil.d) &&
    sisa[0].n === 0;
  console.log(lulus ? '=> SEMUA SESUAI ✓' : '=> ADA YANG TIDAK SESUAI ✗');
  await prisma.$disconnect();
  process.exit(lulus ? 0 : 1);
})().catch((e) => { console.error('FATAL:', String(e.message).slice(0, 200)); process.exit(1); });
