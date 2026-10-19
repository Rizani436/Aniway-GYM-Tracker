'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { saveWorkoutSessionSchema, type SaveWorkoutSessionInput } from '@/lib/validations';
import { SetType } from '@prisma/client';

async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Tidak terautentikasi. Silakan login kembali.');
  }
  return user;
}

export type ExerciseHistoryInfo = {
  lastSessionDate: Date | null;
  previousSets: Array<{
    setNumber: number;
    weight: number;
    reps: number;
    setType: SetType;
    isCompleted: boolean;
  }>;
  best1RM: number;
  progressiveOverloadSuggestion?: {
    suggestedWeightIncrement: number;
    reason: string;
  } | null;
  avgSets: Array<{ weight: number; reps: number } | null>;
  /** Catatan gerakan dari sesi-sesi sebelumnya (yang ada catatannya), terbaru dulu. */
  noteHistory: Array<{ date: Date; notes: string }>;
};

export async function getWorkoutInitialDataAction(
  programId?: string,
  repeatSessionId?: string
) {
  const user = await requireUser();

  // Semua query dijalankan paralel sekaligus (1 kali round-trip jaringan, bukan berurutan)
  const [userPrograms, availableExercises] = await Promise.all([
    // 1. Seluruh program aktif user untuk opsi ganti/mulai program
    prisma.program.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: { sortOrder: 'asc' },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true },
        },
      },
    }),
    // 2. Seluruh pustaka gerakan untuk modal ganti/tambah alat
    prisma.exercise.findMany({
      where: {
        isArchived: false,
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: [{ primaryMuscle: 'asc' }, { name: 'asc' }],
    }),
  ]);

  // 3. Ambil data program terpilih jika ada
  let selectedProgram = null;
  if (repeatSessionId) {
    // "Program sintetis" dari sesi terakhir: bentuk object ber-shape Program
    // (program + ProgramExercise include exercise) agar mapping state di
    // WorkoutRunner (createExercisesFromProgram) bekerja tanpa diubah.
    const src = await prisma.workoutSession.findFirst({
      where: { id: repeatSessionId, userId: user.id, isCompleted: true },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true, sets: { orderBy: { setNumber: 'asc' } } },
        },
      },
    });
    if (!src) throw new Error('Sesi yang ingin diulang tidak ditemukan.');

    selectedProgram = {
      id: null,
      name: src.name,
      exercises: src.exercises.map((se) => {
        const workReps = se.sets.map((s) => s.reps).filter((r) => r > 0);
        return {
          id: se.id,
          exerciseId: se.exerciseId,
          targetSets: se.sets.filter((s) => s.setType !== SetType.WARMUP).length || 1,
          targetRepMin: workReps.length ? Math.min(...workReps) : 8,
          targetRepMax: workReps.length ? Math.max(...workReps) : 12,
          restSeconds: se.restSeconds,
          notes: se.notes,
          exercise: se.exercise,
        };
      }),
    };
  } else if (programId) {
    selectedProgram = userPrograms.find((p) => p.id === programId) || null;
  }

  // 4. Kumpulkan exerciseId yang relevan untuk preload riwayat
  const relevantExerciseIds = new Set<string>();
  if (selectedProgram) {
    selectedProgram.exercises.forEach((pe) => relevantExerciseIds.add(pe.exerciseId));
  }

  // 5. Query riwayat sesi terakhir & best 1RM untuk setiap gerakan relevan secara paralel
  const historyMap: Record<string, ExerciseHistoryInfo> = {};

  await Promise.all(
    Array.from(relevantExerciseIds).map(async (exId) => {
      const targetRepMax = selectedProgram?.exercises.find((pe) => pe.exerciseId === exId)?.targetRepMax;
      const history = await getExerciseHistoryForUser(user.id, exId, targetRepMax);
      historyMap[exId] = history;
    })
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      weightUnit: user.weightUnit,
      defaultRestTimer: user.defaultRestTimer,
    },
    selectedProgram,
    userPrograms,
    availableExercises,
    historyMap,
  };
}

export async function getExerciseHistoryAction(exerciseId: string, targetRepMax?: number) {
  const user = await requireUser();
  return getExerciseHistoryForUser(user.id, exerciseId, targetRepMax);
}

async function getExerciseHistoryForUser(
  userId: string,
  exerciseId: string,
  targetRepMax?: number
): Promise<ExerciseHistoryInfo> {
  const [lastSessionExercise, best1RMAgg, recentSessions, noteSessionExercises] = await Promise.all([
    prisma.sessionExercise.findFirst({
      where: {
        userId,
        exerciseId,
        workoutSession: { isCompleted: true },
      },
      orderBy: { performedAt: 'desc' },
      include: {
        exercise: {
          select: { weightIncrement: true },
        },
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
    }),
    prisma.setLog.aggregate({
      where: {
        userId,
        exerciseId,
        isCompleted: true,
      },
      _max: { estimated1RM: true },
    }),
    // 3 sesi terakhir untuk rata-rata beban/reps per posisi set
    prisma.sessionExercise.findMany({
      where: {
        userId,
        exerciseId,
        workoutSession: { isCompleted: true },
      },
      orderBy: { performedAt: 'desc' },
      take: 3,
      include: {
        sets: {
          where: { isCompleted: true, setType: { not: SetType.WARMUP } },
          orderBy: { setNumber: 'asc' },
        },
      },
    }),
    // Riwayat catatan gerakan dari sesi sebelumnya (hanya yang ada catatannya)
    prisma.sessionExercise.findMany({
      where: {
        userId,
        exerciseId,
        notes: { not: null },
        workoutSession: { isCompleted: true },
      },
      orderBy: { performedAt: 'desc' },
      take: 5,
      select: { performedAt: true, notes: true },
    }),
  ]);

  const best1RM = best1RMAgg._max.estimated1RM || 0;

  if (!lastSessionExercise) {
    return {
      lastSessionDate: null,
      previousSets: [],
      best1RM,
      progressiveOverloadSuggestion: null,
      avgSets: [],
      noteHistory: [],
    };
  }

  // Ambil weightIncrement gerakan tanpa query tambahan per gerakan
  const increment = lastSessionExercise.exercise?.weightIncrement || 2.5;

  const previousSets = lastSessionExercise.sets.map((s) => ({
    setNumber: s.setNumber,
    weight: s.weight,
    reps: s.reps,
    setType: s.setType,
    isCompleted: s.isCompleted,
  }));

  // Logika Progressive Overload:
  // Jika targetRepMax ditentukan dan semua set normal yang selesai mencapai >= targetRepMax
  let progressiveOverloadSuggestion: ExerciseHistoryInfo['progressiveOverloadSuggestion'] = null;

  if (targetRepMax && targetRepMax > 0 && previousSets.length > 0) {
    const completedWorkSets = previousSets.filter(
      (s) => s.isCompleted && s.setType !== SetType.WARMUP
    );

    if (
      completedWorkSets.length > 0 &&
      completedWorkSets.every((s) => s.reps >= targetRepMax)
    ) {
      progressiveOverloadSuggestion = {
        suggestedWeightIncrement: increment,
        reason: `Semua ${completedWorkSets.length} set sesi lalu tembus target (${targetRepMax} rep). Naikkan beban +${increment} kg hari ini!`,
      };
    }
  }

  // Rata-rata per posisi set dari 3 sesi terakhir (set kerja selesai saja).
  // Dipakai chip "Rata 62.5×9" sebagai referensi tambahan di runner.
  const avgSets = recentSessions.length
    ? Array.from(
        { length: Math.max(...recentSessions.map((se) => se.sets.length)) },
        (_, i) => {
          const atPos = recentSessions
            .map((se) => se.sets[i])
            .filter((s): s is NonNullable<typeof s> => !!s && s.reps > 0);
          if (!atPos.length) return null;
          return {
            weight: Math.round((atPos.reduce((a, s) => a + s.weight, 0) / atPos.length) * 10) / 10,
            reps: Math.round(atPos.reduce((a, s) => a + s.reps, 0) / atPos.length),
          };
        }
      )
    : [];

  // Riwayat catatan: buang entri kosong/spasi saja, batasi 5 terbaru.
  const noteHistory = noteSessionExercises
    .map((se) => ({ date: se.performedAt, notes: (se.notes || '').trim() }))
    .filter((n) => n.notes.length > 0)
    .slice(0, 5);

  return {
    lastSessionDate: lastSessionExercise.performedAt,
    previousSets,
    best1RM,
    progressiveOverloadSuggestion,
    avgSets,
    noteHistory,
  };
}

export type NewPRInfo = {
  exerciseName: string;
  weight: number;
  reps: number;
  new1RM: number;
  previousBest1RM: number;
};

export async function saveWorkoutSessionAction(input: SaveWorkoutSessionInput) {
  const user = await requireUser();
  const parsed = saveWorkoutSessionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const data = parsed.data;

  // Idempotensi: id dari klien (clientSessionId) dipakai sebagai WorkoutSession.id,
  // supaya kiriman ulang dari antrean offline TIDAK membuat sesi dobel.
  if (data.id) {
    const sudahAda = await prisma.workoutSession.findUnique({
      where: { id: data.id },
      select: { id: true, totalVolume: true, durationSec: true, userId: true },
    });
    if (sudahAda) {
      if (sudahAda.userId !== user.id) throw new Error('Sesi sudah ada dan bukan milik Anda.');
      return {
        success: true,
        sessionId: sudahAda.id,
        totalVolume: sudahAda.totalVolume,
        durationSec: sudahAda.durationSec,
        newPRs: [],
        duplicate: true,
      };
    }
  }

  const startedAt = new Date(data.startedAt);
  const endedAt = data.endedAt ? new Date(data.endedAt) : new Date();

  // 1. Ambil data nama & best 1RM seluruh gerakan yang dilakukan dalam sesi ini
  const exerciseIds = data.exercises.map((e) => e.exerciseId);
  const [exercisesDb, best1RMsDb] = await Promise.all([
    prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, name: true },
    }),
    prisma.setLog.groupBy({
      by: ['exerciseId'],
      where: {
        userId: user.id,
        exerciseId: { in: exerciseIds },
        isCompleted: true,
      },
      _max: { estimated1RM: true },
    }),
  ]);

  const exerciseMap = new Map(exercisesDb.map((e) => [e.id, e.name]));
  const best1RMMap = new Map<string, number>();
  best1RMsDb.forEach((b) => {
    best1RMMap.set(b.exerciseId, b._max.estimated1RM || 0);
  });

  // 2. Kalkulasi total volume & deteksi rekor personal (PR)
  let totalVolume = 0;
  const newPRs: NewPRInfo[] = [];

  const processedExercises = data.exercises.map((ex, exIndex) => {
    const currentBest1RM = best1RMMap.get(ex.exerciseId) || 0;
    let highestSet1RMInSession = currentBest1RM;

    const processedSets = ex.sets.map((set, sIndex) => {
      // Epley Formula: 1RM = Weight * (1 + Reps / 30)
      const estimated1RM =
        set.reps > 0 && set.weight > 0
          ? Math.round((set.weight * (1 + set.reps / 30)) * 10) / 10
          : 0;

      let isPR = false;
      if (set.isCompleted && estimated1RM > highestSet1RMInSession && estimated1RM > 0) {
        isPR = true;
        newPRs.push({
          exerciseName: exerciseMap.get(ex.exerciseId) || 'Gerakan',
          weight: set.weight,
          reps: set.reps,
          new1RM: estimated1RM,
          previousBest1RM: highestSet1RMInSession,
        });
        highestSet1RMInSession = estimated1RM;
      }

      if (set.isCompleted) {
        totalVolume += set.weight * set.reps;
      }

      return {
        setNumber: sIndex + 1,
        weight: set.weight,
        reps: set.reps,
        setType: set.setType,
        rpe: set.rpe || null,
        estimated1RM,
        isCompleted: set.isCompleted,
        isPersonalRecord: isPR,
        performedAt: endedAt,
        userId: user.id,
        exerciseId: ex.exerciseId,
      };
    });

    return {
      exerciseId: ex.exerciseId,
      sortOrder: exIndex + 1,
      restSeconds: ex.restSeconds,
      notes: ex.notes || null,
      performedAt: endedAt,
      userId: user.id,
      sets: processedSets,
    };
  });

  // 3. Simpan ke database dalam Prisma Transaction
  //
  // PENTING (pernah jadi bug produksi): interactive transaction Prisma punya
  // batas default 5 detik. DB (Supabase pooler Sydney) berlatensi ~410 ms/query,
  // jadi transaksi dengan 1 query per gerakan + 1 per grup set MUDAH lewat batas:
  // sesi 9 gerakan = 19 query ≈ 8 detik → gagal `P2028: Transaction not found`
  // dan user cuma melihat "An error occurred in the Server Components render".
  //
  // Karena itu semua penulisan dilakukan sebagai BULK query, bukan per-baris:
  //   create sesi (1) → createMany SessionExercise, kembalikan id (1)
  //   → createMany SetLog (1)  = 3 query TOTAL, konstan untuk berapa pun jumlah gerakan.
  // Interactive transaction + timeout 15s tetap dipertahankan sebagai jaring aman.
  const createdSession = await prisma.$transaction(
    async (tx) => {
      const session = await tx.workoutSession.create({
        data: {
          id: data.id || undefined, // undefined -> default cuid()
          userId: user.id,
          programId: data.programId || null,
          name: data.name,
          startedAt,
          endedAt,
          durationSec: data.durationSec,
          totalVolume,
          notes: data.notes || null,
          isCompleted: true,
        },
      });

      // createManyAndReturn (Prisma 5.14+/Postgres) mengembalikan id tiap baris
      // sesuai urutan input → pasangan index dengan processedExercises valid.
      const createdExercises = await tx.sessionExercise.createManyAndReturn({
        data: processedExercises.map((exData) => ({
          workoutSessionId: session.id,
          userId: user.id,
          exerciseId: exData.exerciseId,
          sortOrder: exData.sortOrder,
          restSeconds: exData.restSeconds,
          notes: exData.notes,
          performedAt: exData.performedAt,
        })),
        select: { id: true },
      });

      const setRows = processedExercises.flatMap((exData, i) => {
        const sessionExerciseId = createdExercises[i]?.id;
        if (!sessionExerciseId) return [];
        return exData.sets.map((s) => ({ ...s, sessionExerciseId }));
      });

      if (setRows.length > 0) {
        await tx.setLog.createMany({ data: setRows });
      }

      return session;
    },
    { timeout: 15_000 }
  );

  revalidatePath('/riwayat');
  revalidatePath('/workout');
  revalidatePath('/');

  return {
    success: true,
    sessionId: createdSession.id,
    totalVolume,
    durationSec: data.durationSec,
    newPRs,
  };
}
