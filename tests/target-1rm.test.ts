import { describe, it, expect } from 'vitest';
import {
  zTarget1RM,
  estimateEpley,
  pctOfTarget,
  badgeStatus,
} from '@/lib/target-1rm';

describe('estimateEpley (1RM = w * (1 + reps/30))', () => {
  it('1 rep = berat itu sendiri', () => {
    expect(estimateEpley(100, 1)).toBe(100);
  });
  it('5 reps @ 100 -> ~116.67', () => {
    expect(estimateEpley(100, 5)).toBeCloseTo(100 * (1 + 5 / 30), 9);
  });
  it('input kotor (NaN/negatif) -> 0', () => {
    expect(estimateEpley(NaN, 5)).toBe(0);
    expect(estimateEpley(-10, 1)).toBe(0);
  });
});

describe('badgeStatus', () => {
  it('belum tercapai -> "progress"', () => {
    expect(badgeStatus(pctOfTarget(81, 90))).toBe('progress');
  });
  it('tepat 100% -> "done"', () => {
    expect(badgeStatus(pctOfTarget(90, 90))).toBe('done');
  });
  it('melebihi target -> "done"', () => {
    expect(badgeStatus(pctOfTarget(95, 90))).toBe('done');
  });
  it('tanpa target / tanpa PR -> null (badge tak tampil)', () => {
    expect(badgeStatus(pctOfTarget(0, 90))).toBe(null);
    expect(badgeStatus(pctOfTarget(81, 0))).toBe(null);
    expect(badgeStatus(pctOfTarget(NaN, 90))).toBe(null);
  });
});
