import { describe, it, expect } from 'vitest';
import { LB_PER_KG, KG_PER_LB, isLb, toDisplayWeight, toKg, roundWeight } from '@/lib/units';
import type { WeightUnit } from '@prisma/client';

// ATURAN KANONIK: DB selalu kg; LB hanya preferensi tampilan.
describe('lib/units — aturan kanonik kg', () => {
  it('isLb toleran kapital/nil', () => {
    expect(isLb('LB')).toBe(true);
    expect(isLb('lb')).toBe(true);
    expect(isLb('KG')).toBe(false);
    expect(isLb(null)).toBe(false);
    expect(isLb(undefined)).toBe(false);
  });

  it('toDisplayWeight: kg apa adanya, lb dikonversi', () => {
    expect(toDisplayWeight(100, 'KG')).toBe(100);
    expect(toDisplayWeight(100, 'LB')).toBeCloseTo(220.46226218, 6);
    expect(toDisplayWeight(0, 'LB')).toBe(0);
    expect(toDisplayWeight(NaN, 'LB')).toBe(0);
  });

  it('toKg: input lb kembali ke kg kanonik (round-trip)', () => {
    expect(toKg(100, 'KG')).toBe(100);
    const kembali = toKg(toDisplayWeight(100, 'LB'), 'LB');
    expect(kembali).toBeCloseTo(100, 9);
    expect(KG_PER_LB * LB_PER_KG).toBeCloseTo(1, 12);
  });

  it('roundWeight membulatkan 1 desimal di kedua satuan', () => {
    expect(roundWeight(72.55, 'KG')).toBe(72.6);
    expect(roundWeight(100, 'LB')).toBe(220.5);
    const unit: WeightUnit = 'KG';
    expect(roundWeight(72.54, unit)).toBe(72.5);
  });
});
