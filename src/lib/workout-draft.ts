/**
 * Logika draft sesi latihan (localStorage) — dipisah dari komponen supaya bisa
 * diuji unit tanpa React/DOM.
 *
 * MASALAH YANG DISELESAIKAN
 * Dulu `workout-runner` membangun ulang daftar gerakan dari program setiap kali
 * `/workout?programId=X` dibuka, dan bahkan MENGHAPUS draft bila programId-nya
 * beda. Akibatnya isi sesi yang sudah diisi lalu ditinggal (keluar aplikasi)
 * hilang tanpa peringatan: draft lama tertimpa auto-save dari state kosong.
 *
 * ATURAN SEKARANG
 *  - tidak ada draft                -> mulai baru (senyap)
 *  - draft segar, program sama      -> lanjut senyap (kasus "balik ke workout
 *                                      sebelumnya" yang diinginkan user)
 *  - draft segar, program beda      -> TANYA (jangan pernah hapus diam-diam)
 *  - draft kedaluwarsa (>18 jam)    -> TANYA
 * Selama belum diputuskan, auto-save DITAHAN (lihat `autosaveBlocked`) supaya
 * draft lama tidak tertimpa.
 */

export interface WorkoutDraftShape {
  sessionName?: string;
  programId?: string | null;
  startedAt: string;
  sessionNotes?: string;
  exercises: unknown[];
  updatedAt?: number;
}

/** Draft yang lebih tua dari ini tidak lagi dianggap "sesi berjalan". */
export const DRAFT_MAX_AGE_MS = 18 * 60 * 60 * 1000;

/** Parse draft dari localStorage; null kalau kosong/rusak/tanpa gerakan. */
export function parseWorkoutDraft(raw: string | null | undefined): WorkoutDraftShape | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WorkoutDraftShape | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) return null;
    if (!parsed.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Usia draft (ms). Infinity kalau `startedAt` tidak valid. */
export function draftAgeMs(draft: Pick<WorkoutDraftShape, 'startedAt'>, now: number = Date.now()): number {
  const t = new Date(draft.startedAt).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return Math.max(0, now - t);
}

export type DraftPlan =
  | { kind: 'fresh' }
  | { kind: 'resume'; draft: WorkoutDraftShape }
  | { kind: 'ask'; draft: WorkoutDraftShape; reason: 'stale' | 'other-program' };

/**
 * Keputusan saat halaman workout dibuka.
 * `requestedProgramId` = programId di URL (tombol "Mulai" sebuah program).
 */
export function planDraftLoad({
  draft,
  requestedProgramId,
  now = Date.now(),
}: {
  draft: WorkoutDraftShape | null;
  requestedProgramId?: string | null;
  now?: number;
}): DraftPlan {
  if (!draft) return { kind: 'fresh' };

  // Sesi yang sudah terlalu lama: tetap ditawarkan, tapi jangan auto-isi —
  // sesi kemarin/pekan lalu tidak boleh muncul tiba-tiba sebagai sesi aktif.
  if (draftAgeMs(draft, now) >= DRAFT_MAX_AGE_MS) {
    return { kind: 'ask', draft, reason: 'stale' };
  }

  // Tanpa program di URL: user membuka /workout (ikon PWA / nav bawah) ->
  // lanjut senyap, ini kasus utama yang dikeluhkan.
  if (!requestedProgramId) return { kind: 'resume', draft };

  // Program yang diminta sama dengan program sesi berjalan -> tetap lanjut senyap.
  if (draft.programId && draft.programId === requestedProgramId) {
    return { kind: 'resume', draft };
  }

  // Beda program: salah pilih di sini = kehilangan isi sesi. Tanya dulu.
  return { kind: 'ask', draft, reason: 'other-program' };
}
