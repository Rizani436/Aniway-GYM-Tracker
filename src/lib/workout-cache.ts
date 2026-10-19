/**
 * Cache data awal sesi latihan di perangkat.
 *
 * Kenapa perlu: /workout bergantung pada getWorkoutInitialDataAction (server).
 * Tanpa internet, server tidak bisa dihubungi — padahal tempat gym sering tanpa
 * sinyal. Karena itu snapshot terakhir disimpan di perangkat, dan runner memakai
 * snapshot itu saat offline. Data ini BUKAN sumber kebenaran: begitu online,
 * /workout selalu memakai data segar dari server.
 */
import type { ExerciseHistoryInfo } from '@/app/actions/workout-actions';

export interface WorkoutSnapshot {
  savedAt: number;
  user: { id: string; name: string | null; email: string; weightUnit: string; defaultRestTimer: number };
  selectedProgram: unknown | null;
  userPrograms: unknown[];
  availableExercises: unknown[];
  historyMap: Record<string, ExerciseHistoryInfo>;
}

const KEY = (userId: string) => `aniway_workout_snapshot_${userId}`;

export function saveWorkoutSnapshot(userId: string, snap: Omit<WorkoutSnapshot, 'savedAt'>) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify({ ...snap, savedAt: Date.now() }));
  } catch {
    // Kuota penuh / mode privat: abaikan, sesi masih bisa dicatat manual
  }
}

export function loadWorkoutSnapshot(userId: string): WorkoutSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutSnapshot;
    if (!parsed?.user?.id || !Array.isArray(parsed.availableExercises)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Cari userId dari snapshot mana pun (dipakai saat offline & sesi auth tak terbaca). */
export function findSnapshotUserId(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('aniway_workout_snapshot_')) return k.replace('aniway_workout_snapshot_', '');
    }
  } catch {}
  return null;
}
