import assert from 'node:assert';
import { calculatePlates } from '../src/lib/plate-calculator';

// barbell Olympic 20kg, plat tersedia [25, 20, 15, 10, 5, 2.5, 1.25]
// 62.5kg → (62.5-20)/2 = 21.25 per sisi → 20 + 1.25 (greedy: plat paling sedikit)
assert.deepStrictEqual(calculatePlates(62.5, 20), [20, 1.25]);
// 40kg → 10 per sisi
assert.deepStrictEqual(calculatePlates(40, 20), [10]);
// 100kg → 25 + 15 per sisi... (100-20)/2 = 40 → 25 + 15
assert.deepStrictEqual(calculatePlates(100, 20), [25, 15]);
// lebih ringan dari bar → kosong
assert.deepStrictEqual(calculatePlates(15, 20), []);
// persis bar saja → kosong
assert.deepStrictEqual(calculatePlates(20, 20), []);
// beban ganjil yang tak bisa dibentuk → throw dengan pesan jelas
assert.throws(() => calculatePlates(63, 20), /tidak bisa dibentuk/);
// floating point: 7.5 = 5 + 2.5
assert.deepStrictEqual(calculatePlates(35, 20), [5, 2.5]);

console.log('✓ test-plate-calculator lulus');
