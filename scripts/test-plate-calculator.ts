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

// Mode LB: bar 45 lb, plat [45, 35, 25, 10, 5, 2.5]
// 135 lb → (135-45)/2 = 45 per sisi → satu plat 45
assert.deepStrictEqual(calculatePlates(135, 45, [45, 35, 25, 10, 5, 2.5]), [45]);
// 225 lb → 90 per sisi → 45 + 45 (greedy: plat terbesar dulu, paling sedikit)
assert.deepStrictEqual(calculatePlates(225, 45, [45, 35, 25, 10, 5, 2.5]), [45, 45]);
// lebih ringan dari bar 45 lb → kosong
assert.deepStrictEqual(calculatePlates(40, 45, [45, 35, 25, 10, 5, 2.5]), []);

console.log('✓ test-plate-calculator lulus');
