'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { SetType } from '@prisma/client';
import { startOfDay, format, subDays, differenceInCalendarDays } from 'date-fns';

async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Tidak terautentikasi. Silakan login kembali.');
  }
  return user;
}

export async function getRiwayatDataAction() {
  const user = await requireUser();

  // Kedua query dijalankan paralel: 1 round-trip gabungan, bukan 2 berurutan.
  const [sessions, availableExercises] = await Promise.all([
    prisma.workoutSession.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      orderBy: { startedAt: 'desc' },
      include: {
        program: {
          select: { id: true, name: true, color: true },
        },
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    }),
    // Daftar gerakan untuk modal input sesi manual
    prisma.exercise.findMany({
      where: {
        isArchived: false,
        OR: [{ userId: null }, { userId: user.id }],
      },
      select: {
        id: true,
        name: true,
        primaryMuscle: true,
        equipment: true,
        weightIncrement: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  // 1. Kalkulasi Statistik Utama & Streak
  const totalSessions = sessions.length;
  let totalLifetimeVolume = 0;
  let totalPRs = 0;

  sessions.forEach((s) => {
    totalLifetimeVolume += s.totalVolume;
    s.exercises.forEach((e) => {
      e.sets.forEach((set) => {
        if (set.isPersonalRecord) totalPRs++;
      });
    });
  });

  // Kalkulasi Streak (hari unik latihan)
  const uniqueDates = Array.from(
    new Set(sessions.map((s) => format(new Date(s.startedAt), 'yyyy-MM-dd')))
  ).sort().reverse(); // Dari paling baru ke lama

  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Jika latihan hari ini atau kemarin, streak aktif
    const latestDate = uniqueDates[0];
    if (latestDate === today || latestDate === yesterday) {
      currentStreak = 1;
      let prevDate = new Date(latestDate);

      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const diff = differenceInCalendarDays(prevDate, currentDate);
        if (diff === 1) {
          currentStreak++;
          prevDate = currentDate;
        } else {
          break;
        }
      }
    }
  }

  // 2. Data Heatmap (180 hari terakhir)
  const heatmapMap: Record<string, { count: number; volume: number }> = {};
  sessions.forEach((s) => {
    const dateStr = format(new Date(s.startedAt), 'yyyy-MM-dd');
    if (!heatmapMap[dateStr]) {
      heatmapMap[dateStr] = { count: 0, volume: 0 };
    }
    heatmapMap[dateStr].count += 1;
    heatmapMap[dateStr].volume += s.totalVolume;
  });

  const heatmapData = Object.entries(heatmapMap).map(([date, val]) => ({
    date,
    count: val.count,
    volume: val.volume,
  }));

  // Ambil daftar gerakan untuk modal input sesi manual
  // (sudah dijalankan paralel di atas)

  return {
    sessions,
    stats: {
      totalSessions,
      totalLifetimeVolume,
      totalPRs,
      currentStreak,
    },
    heatmapData,
    availableExercises,
  };
}

export async function deleteWorkoutSessionAction(sessionId: string) {
  const user = await requireUser();

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });

  if (!existing) {
    throw new Error('Sesi latihan tidak ditemukan.');
  }

  await prisma.workoutSession.delete({
    where: { id: sessionId },
  });

  revalidatePath('/riwayat');
  revalidatePath('/');
  return { success: true };
}

export async function updateWorkoutSessionAction(
  sessionId: string,
  data: { name: string; notes?: string; startedAt?: string }
) {
  const user = await requireUser();

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });

  if (!existing) {
    throw new Error('Sesi latihan tidak ditemukan.');
  }

  const updated = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      name: data.name.trim(),
      notes: data.notes?.trim() || null,
      ...(data.startedAt ? { startedAt: new Date(data.startedAt) } : {}),
    },
  });

  revalidatePath('/riwayat');
  revalidatePath('/');
  return updated;
}

export type ManualSessionInput = {
  name: string;
  date: string; // YYYY-MM-DD
  durationMin: number;
  notes?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      weight: number;
      reps: number;
      setType?: SetType;
    }>;
  }>;
};

export async function createManualWorkoutSessionAction(input: ManualSessionInput) {
  const user = await requireUser();

  if (!input.name || !input.date || input.exercises.length === 0) {
    throw new Error('Lengkapi nama, tanggal, dan minimal 1 gerakan latihan.');
  }

  const sessionDate = new Date(input.date + 'T10:00:00');
  const durationSec = (input.durationMin || 45) * 60;
  const endedDate = new Date(sessionDate.getTime() + durationSec * 1000);

  // Kalkulasi total volume & simpan
  let totalVolume = 0;

  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.workoutSession.create({
      data: {
        userId: user.id,
        name: input.name,
        startedAt: sessionDate,
        endedAt: endedDate,
        durationSec,
        totalVolume: 0,
        notes: input.notes || null,
        isCompleted: true,
      },
    });

    for (let i = 0; i < input.exercises.length; i++) {
      const ex = input.exercises[i];
      const sessionExercise = await tx.sessionExercise.create({
        data: {
          workoutSessionId: createdSession.id,
          userId: user.id,
          exerciseId: ex.exerciseId,
          sortOrder: i + 1,
          performedAt: sessionDate,
        },
      });

      for (let s = 0; s < ex.sets.length; s++) {
        const set = ex.sets[s];
        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        const estimated1RM =
          reps > 0 && weight > 0 ? Math.round((weight * (1 + reps / 30)) * 10) / 10 : 0;

        totalVolume += weight * reps;

        await tx.setLog.create({
          data: {
            sessionExerciseId: sessionExercise.id,
            userId: user.id,
            exerciseId: ex.exerciseId,
            setNumber: s + 1,
            weight,
            reps,
            setType: set.setType || SetType.NORMAL,
            estimated1RM,
            isCompleted: true,
            isPersonalRecord: false,
            performedAt: sessionDate,
          },
        });
      }
    }

    await tx.workoutSession.update({
      where: { id: createdSession.id },
      data: { totalVolume },
    });

    return createdSession;
  });

  revalidatePath('/riwayat');
  revalidatePath('/');
  return { success: true, sessionId: session.id };
}

export async function updateSetLogAction(
  setId: string,
  data: { weight: number; reps: number }
) {
  const user = await requireUser();

  const set = await prisma.setLog.findFirst({
    where: { id: setId, userId: user.id },
    include: { sessionExercise: { select: { workoutSessionId: true } } },
  });
  if (!set) {
    throw new Error('Set tidak ditemukan.');
  }

  const weight = Number(data.weight) || 0;
  const reps = Math.max(0, Math.round(Number(data.reps) || 0));
  const estimated1RM =
    reps > 0 && weight > 0 ? Math.round((weight * (1 + reps / 30)) * 10) / 10 : 0;

  // Satu transaksi: update set + hitung ulang totalVolume sesi dari semua set selesai
  // (definisi volume sama dengan saveWorkoutSessionAction; aggregate Prisma tak bisa mengalikan kolom).
  // ponytail: isPersonalRecord sengaja tidak dihitung ulang — flag momen historis, keputusan plan.
  await prisma.$transaction(async (tx) => {
    await tx.setLog.update({
      where: { id: setId },
      data: { weight, reps, estimated1RM },
    });

    const sessionSets = await tx.setLog.findMany({
      where: {
        isCompleted: true,
        sessionExercise: { workoutSessionId: set.sessionExercise.workoutSessionId },
      },
      select: { weight: true, reps: true },
    });
    const totalVolume = sessionSets.reduce((s, x) => s + x.weight * x.reps, 0);

    await tx.workoutSession.update({
      where: { id: set.sessionExercise.workoutSessionId },
      data: { totalVolume },
    });
  });

  revalidatePath('/riwayat');
  revalidatePath('/');
  return { success: true };
}
