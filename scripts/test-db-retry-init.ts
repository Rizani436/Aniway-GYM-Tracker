// Uji JUJUR: apakah withDbRetry benar-benar mengulang error PrismaClientInitializationError
// (host tidak bisa dihubungi), yang ternyata punya code=undefined dan pesan bisa kosong?
import { PrismaClient } from '@prisma/client';
import { withDbRetry, __internal } from '../src/lib/db-retry';

const buruk = new PrismaClient({
  datasources: { db: { url: 'postgresql://x:x@host-tidak-ada.invalid:5432/db?connect_timeout=3' } },
});

async function main() {
  let err: any = null;
  try {
    await buruk.user.count();
  } catch (e) {
    err = e;
  }
  console.log('name         : ' + err?.name);
  console.log('code         : ' + JSON.stringify(err?.code));
  console.log('pesan penuh  : ' + JSON.stringify(String(err?.message).slice(0, 300)));
  console.log('isRetryable  : ' + __internal.isRetryable(err));

  let panggilan = 0;
  try {
    await withDbRetry(async () => { panggilan++; return await buruk.user.count(); }, 3, 50);
  } catch { /* diharapkan gagal total */ }
  console.log('panggilan    : ' + panggilan + ' (harus 3 kalau retry bekerja, 1 kalau TIDAK)');
  console.log(panggilan >= 2 ? '=> RETRY BEKERJA ✓' : '=> RETRY TIDAK BEKERJA ✗ — pola harus diperbaiki');

  await buruk.$disconnect();
  process.exit(panggilan >= 2 ? 0 : 1);
}

main().catch((e) => { console.error('FATAL:', e?.name, e?.message); process.exit(1); });
