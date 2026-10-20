/**
 * Retry untuk kegagalan KONEKSI database (bukan kegagalan query).
 *
 * Kenapa perlu: pooler Supabase yang jauh bisa memutus koneksi di tengah jalan —
 * terukur di proyek ini: P1001 ("Can't reach database server") muncul konsisten
 * pada ~5030 ms saat query berat, dan P2024 (pool timeout) sesekali. Keduanya
 * BUKAN kesalahan query; percobaan ulang biasanya berhasil. Tanpa retry, satu
 * koneksi putus bikin halaman gagal total.
 *
 * PENTING — hanya untuk operasi BACA:
 *   - Retry pada operasi TULIS berbahaya: kalau tulisan sebenarnya berhasil tapi
 *     responsnya hilang, percobaan ulang bisa membuat data dobel. Untuk tulis,
 *     pakai idempotensi (id dari klien) seperti di saveWorkoutSessionAction.
 *   - Karena itu `$transaction` interaktif juga JANGAN dibungkus helper ini.
 */

/** Kode error Prisma/Postgres yang layak dicoba ulang (semuanya soal koneksi). */
const RETRYABLE_CODES = new Set([
  'P1001', // Can't reach database server
  'P1002', // Database server timed out
  'P1008', // Operations timed out
  'P1017', // Server has closed the connection
  'P2024', // Timed out fetching a connection from the pool
]);

/** Pola pesan untuk error koneksi yang tidak selalu punya kode. */
const RETRYABLE_MESSAGE = /can't reach database|connection closed|connection reset|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|socket hang up|Timed out fetching a new connection/i;

/**
 * Kelas error Prisma yang berarti "DB tidak terjangkau", bukan "query salah".
 *
 * Terukur di proyek ini: klien yang diarahkan ke host tak dikenal melempar
 * `PrismaClientInitializationError` dengan `code === undefined` — satu-satunya
 * petunjuk ada di `name` dan `message`. Karena itu deteksi TIDAK boleh
 * bergantung pada `code` saja (kalau pesan kosong, retry tak akan pernah jalan).
 */
const RETRYABLE_NAMES = new Set([
  'PrismaClientInitializationError', // tidak bisa konek / gagal inisialisasi
  'PrismaClientRustPanicError', // mesin query crash, aman diulang untuk BACA
]);

function isRetryable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && RETRYABLE_CODES.has(code)) return true;

  const name = (err as { name?: string })?.name;
  if (name && RETRYABLE_NAMES.has(name)) return true;

  const msg = String((err as Error)?.message ?? '');
  return RETRYABLE_MESSAGE.test(msg);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Jalankan operasi baca dengan percobaan ulang saat koneksi bermasalah.
 *
 * @param fn         operasi baca (prisma.x.findMany / findFirst / groupBy / ...)
 * @param attempts   jumlah percobaan total (default 3)
 * @param baseDelayMs jeda awal; naik linier tiap percobaan (300, 600, ...)
 *
 * Error yang BUKAN masalah koneksi (mis. validasi, unique constraint, not found)
 * langsung dilempar tanpa retry — retry tidak akan menolong dan hanya menunda
 * pesan error ke user.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 300
): Promise<T> {
  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const terakhir = i === attempts - 1;
      if (terakhir || !isRetryable(err)) throw err;
      await sleep(baseDelayMs * (i + 1));
    }
  }

  throw lastErr;
}

/** Versi paralel: semua operasi dibungkus retry masing-masing, lalu dijalankan bersamaan. */
export function allWithDbRetry<T extends readonly unknown[]>(
  fns: { [K in keyof T]: () => Promise<T[K]> },
  attempts = 3
): Promise<{ [K in keyof T]: T[K] }> {
  return Promise.all(fns.map((fn) => withDbRetry(fn, attempts))) as Promise<{
    [K in keyof T]: T[K];
  }>;
}

/** Hanya untuk pengujian/diagnostik. */
export const __internal = { isRetryable };
