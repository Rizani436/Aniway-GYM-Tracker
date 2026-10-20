// Uji perilaku withDbRetry — dijalankan dengan tsx (repo pakai TS).
// Harus membuktikan EMPAT hal:
//   1. sukses langsung -> 1 percobaan
//   2. gagal koneksi lalu sukses -> retry sampai berhasil
//   3. error NON-koneksi -> TIDAK diulang (jangan tunda error ke user)
//   4. gagal terus -> menyerah setelah `attempts`, error asli dilempar
import assert from 'node:assert';
import { withDbRetry, allWithDbRetry, __internal } from '../src/lib/db-retry';

let lolos = 0;
const ok = (label: string) => { console.log('OK   | ' + label); lolos++; };

const errKoneksi = () => Object.assign(new Error("Can't reach database server at pooler"), { code: 'P1001' });
const errQuery = () => Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });

async function main() {
  // 1. sukses langsung
  {
    let calls = 0;
    const hasil = await withDbRetry(async () => { calls++; return 'data'; });
    assert.strictEqual(hasil, 'data');
    assert.strictEqual(calls, 1, 'harus 1 percobaan');
    ok('sukses langsung -> 1 percobaan');
  }

  // 2. gagal koneksi lalu sukses (percobaan ke-3)
  {
    let calls = 0;
    const hasil = await withDbRetry(async () => {
      calls++;
      if (calls < 3) throw errKoneksi();
      return 'pulih';
    }, 3, 10);
    assert.strictEqual(hasil, 'pulih');
    assert.strictEqual(calls, 3);
    ok('gagal koneksi 2x lalu sukses -> berhasil di percobaan ke-3');
  }

  // 3. error NON-koneksi tidak diulang
  {
    let calls = 0;
    await assert.rejects(
      () => withDbRetry(async () => { calls++; throw errQuery(); }, 3, 10),
      /Unique constraint/
    );
    assert.strictEqual(calls, 1, 'error non-koneksi harus langsung dilempar');
    ok('error non-koneksi (P2002) -> tidak diulang');
  }

  // 4. gagal terus -> menyerah, error asli
  {
    let calls = 0;
    await assert.rejects(
      () => withDbRetry(async () => { calls++; throw errKoneksi(); }, 3, 10),
      /Can't reach/
    );
    assert.strictEqual(calls, 3, 'harus tepat 3 percobaan, tidak lebih');
    ok('gagal koneksi terus -> menyerah setelah 3 percobaan');
  }

  // 5. deteksi kode & pesan
  {
    assert.strictEqual(__internal.isRetryable(errKoneksi()), true);
    assert.strictEqual(__internal.isRetryable(errQuery()), false);
    assert.strictEqual(__internal.isRetryable(Object.assign(new Error('x'), { code: 'P2024' })), true);
    assert.strictEqual(__internal.isRetryable(new Error('socket hang up')), true);
    assert.strictEqual(__internal.isRetryable(new Error('halo dunia')), false);
    ok('deteksi kode P1001/P2024 + pesan koneksi, tolak error lain');
  }

  // 6. versi paralel: satu gagal koneksi, satu lancar
  {
    let a = 0, b = 0;
    const [x, y] = await allWithDbRetry([
      async () => { a++; if (a < 2) throw errKoneksi(); return 'A'; },
      async () => { b++; return 'B'; },
    ], 3);
    assert.strictEqual(x, 'A');
    assert.strictEqual(y, 'B');
    assert.strictEqual(a, 2);
    assert.strictEqual(b, 1);
    ok('allWithDbRetry: satu retry, satu sekali jalan, hasil benar');
  }

  console.log('\n=> SEMUA LOLOS (' + lolos + ' kasus)');
}

main().catch((e) => { console.error('GAGAL:', e.message); process.exit(1); });
