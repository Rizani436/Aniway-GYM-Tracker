import { describe, it, expect } from 'vitest';
import {
  parseWorkoutDraft,
  draftAgeMs,
  planDraftLoad,
  DRAFT_MAX_AGE_MS,
  type WorkoutDraftShape,
} from '@/lib/workout-draft';

const NOW = new Date('2026-10-26T14:00:00.000Z').getTime();
const segar = (startedAt: string, programId: string | null = 'prog-push'): WorkoutDraftShape => ({
  sessionName: 'Push Day',
  programId,
  startedAt,
  exercises: [{ exerciseId: 'ex1', sets: [{ weight: 60 }] }],
  updatedAt: NOW,
});

describe('parseWorkoutDraft', () => {
  it('null untuk kosong / JSON rusak / draft tanpa gerakan', () => {
    expect(parseWorkoutDraft(null)).toBe(null);
    expect(parseWorkoutDraft('bukan json')).toBe(null);
    expect(parseWorkoutDraft(JSON.stringify({ startedAt: NOW, exercises: [] }))).toBe(null);
    expect(parseWorkoutDraft(JSON.stringify({ exercises: [{ a: 1 }] }))).toBe(null);
  });

  it('menerima draft sah', () => {
    const d = parseWorkoutDraft(JSON.stringify(segar('2026-10-26T13:00:00.000Z')));
    expect(d?.programId).toBe('prog-push');
    expect(d?.exercises).toHaveLength(1);
  });
});

describe('draftAgeMs', () => {
  it('menghitung usia dari startedAt', () => {
    expect(draftAgeMs({ startedAt: '2026-10-26T13:00:00.000Z' }, NOW)).toBe(60 * 60 * 1000);
  });
  it('startedAt rusak -> Infinity (dianggap kedaluwarsa)', () => {
    expect(draftAgeMs({ startedAt: 'ngawur' }, NOW)).toBe(Infinity);
  });
});

describe('planDraftLoad — kasus yang dilaporkan user', () => {
  it('tanpa draft -> mulai baru', () => {
    expect(planDraftLoad({ draft: null, now: NOW })).toEqual({ kind: 'fresh' });
  });

  it('buka ikon PWA -> /workout tanpa program: draft SEGAR dilanjutkan SENYAP', () => {
    const draft = segar('2026-10-26T13:30:00.000Z');
    const plan = planDraftLoad({ draft, requestedProgramId: null, now: NOW });
    expect(plan.kind).toBe('resume');
    if (plan.kind === 'resume') expect(plan.draft).toBe(draft);
  });

  it('balik lewat program yang SAMA -> lanjut senyap (tidak diulang dari awal)', () => {
    const draft = segar('2026-10-26T13:30:00.000Z', 'prog-push');
    const plan = planDraftLoad({ draft, requestedProgramId: 'prog-push', now: NOW });
    expect(plan.kind).toBe('resume');
  });

  it('program BERBEDA -> tanya, jangan hapus diam-diam', () => {
    const draft = segar('2026-10-26T13:30:00.000Z', 'prog-push');
    const plan = planDraftLoad({ draft, requestedProgramId: 'prog-leg', now: NOW });
    expect(plan.kind).toBe('ask');
    if (plan.kind === 'ask') expect(plan.reason).toBe('other-program');
  });

  it('draft kedaluwarsa (> 18 jam) -> tanya, tidak auto-isi', () => {
    const draft = segar(new Date(NOW - DRAFT_MAX_AGE_MS - 1000).toISOString());
    const plan = planDraftLoad({ draft, requestedProgramId: null, now: NOW });
    expect(plan.kind).toBe('ask');
    if (plan.kind === 'ask') expect(plan.reason).toBe('stale');
  });

  it('draft tepat 18 jam -> tetap ditanya (batas inklusif)', () => {
    const draft = segar(new Date(NOW - DRAFT_MAX_AGE_MS).toISOString());
    expect(planDraftLoad({ draft, requestedProgramId: null, now: NOW }).kind).toBe('ask');
  });

  it('draft tanpa programId tapi dibuka dgn program -> tanya (tidak bisa dipastikan sama)', () => {
    const draft = segar('2026-10-26T13:30:00.000Z', null);
    const plan = planDraftLoad({ draft, requestedProgramId: 'prog-push', now: NOW });
    expect(plan.kind).toBe('ask');
  });
});
