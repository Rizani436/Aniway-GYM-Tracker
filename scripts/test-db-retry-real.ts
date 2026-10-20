// Bukti retry bekerja dengan error PRISMA NYATA (bukan error buatan).
//
// Skenario: PrismaClient diarahkan ke host yang tidak ada -> error P1001 asli dari
// driver, lalu diganti klien yang benar. Retry harus menyerap kegagalan pertama
// dan tetap mengembalikan data pada percobaan berikutnya.
import { PrismaClient } from '@prisma/client';
import { withDbRetry } from '../src/lib/db-retry';

const baik = new PrismaClient();
const buruk = new PrismaClient({
  datasources: { db: { url: 'postgresql://x:x@host-tidak-ada-aniway.invalid:5432/db?connect_timeout=3' } },
});

async function main() {
  // 1. Pastikan error "buruk" memang P1001 asli
  let kodeAsli = '(tak terpanggil)';
  try {
    await buruk.user.count();
  } catch (e) {
    kodeAsli = (e as { code?: string }).code || String((e as Error).message).slice(0, 60);
  }
  console.log('error dari klien buruk: ' + kodeAsli);
  if (!String(kodeAsli).startsWith('P1001')) {
    console.log('CATATAN: kode bukan P1001 (mungkin P1000/P1003) — cek pola retry mencakupnya');
  }

  // 2. Operasi: gagal (klien buruk) -> pulih (klien baik), di dalam withDbRetry
  let percobaan = 0;
  const t0 = Date.now();
  const jumlah = await withDbRetry(async () => {
    percobaan++;
    if (percobaan === 1) return await buruk.user.count(); // P1001 asli
    return await baik.user.count();
  }, 3, 300);
  const ms = Date.now() - t0;

  console.log('percobaan dipakai    : ' + percobaan + ' (harus 2)');
  console.log('hasil akhir          : ' + jumlah + ' user terbaca dari DB nyata');
  console.log('durasi               : ' + ms + ' ms');
  const lolos = percobaan === 2 && typeof jumlah === 'number';
  console.log(lolos ? '\n=> RETRY MENYERAP P1001 NYATA ✓' : '\n=> GAGAL ✗');

  // 3. Error non-koneksi TIDAK diulang, walau dengan klien nyata
  let p2 = 0;
  try {
    await withDbRetry(async () => {
      p2++;
      // Query sah tapi tabel tidak ada -> error skema, bukan koneksi
      return await baik.$queryRaw`SELECT 1 FROM tabel_yang_tidak_ada_aniway`;
    }, 3, 50);
  } catch {
    /* diharapkan gagal */
  }
  console.log('percobaan error skema: ' + p2 + ' (harus 1 — tidak diulang)');
  const lolos2 = p2 === 1;
  console.log(lolos2 ? '=> ERROR SKEMA TIDAK DIULANG ✓' : '=> GAGAL: error skema ikut diulang ✗');

  await baik.$disconnect();
  await buruk.$disconnect();
  process.exit(lolos && lolos2 ? 0 : 1);
}

main().catch((e) => { console.error('FATAL:', (e as { code?: string }).code || e.message); process.exit(1); });
