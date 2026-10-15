'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { SetType } from '@prisma/client';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Tidak terautentikasi. Silakan login kembali.');
  }
  return user;
}

// ============================================================
// Grafik progres per gerakan
// ============================================================

export type ProgressPoint = {
  date: string; // 'yyyy-MM-dd'
  best1RM: number; // max estimated1RM sesi itu
  topWeight: number; // beban terberat sesi itu
  volume: number; // total volume sesi itu
  isPR: boolean; // ada set berflag PR di sesi itu
};

export async function getExerciseProgressAction(
  exerciseId: string
): Promise<ProgressPoint[]> {
  const user = await requireUser();
  const sets = await prisma.setLog.findMany({
    where: {
      userId: user.id,
      exerciseId,
      isCompleted: true,
      setType: { not: SetType.WARMUP },
    },
    orderBy: { performedAt: 'asc' },
    select: {
      performedAt: true,
      weight: true,
      reps: true,
      estimated1RM: true,
      isPersonalRecord: true,
    },
  });

  // Agregasi per hari (2 sesi di hari sama digabung jadi 1 titik — cukup untuk chart).
  const byDay = new Map<string, ProgressPoint>();
  for (const s of sets) {
    const date = format(s.performedAt, 'yyyy-MM-dd');
    const cur = byDay.get(date) ?? {
      date,
      best1RM: 0,
      topWeight: 0,
      volume: 0,
      isPR: false,
    };
    cur.best1RM = Math.max(cur.best1RM, s.estimated1RM);
    cur.topWeight = Math.max(cur.topWeight, s.weight);
    cur.volume += s.weight * s.reps;
    cur.isPR = cur.isPR || s.isPersonalRecord;
    byDay.set(date, cur);
  }
  // Batasi 90 hari terakhir agar chart tetap ringan.
  return [...byDay.values()].slice(-90);
}

// ============================================================
// Halaman PR Saya
// ============================================================

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  performedAt: string; // ISO
};

export async function getPersonalRecordsAction(): Promise<PersonalRecord[]> {
  const user = await requireUser();
  // Flag PR menandai momen rekor; ambil semua lalu pilih yang tertinggi per gerakan.
  // Volume data user aktif = ratusan baris, aman di-agg di JS.
  const prSets = await prisma.setLog.findMany({
    where: { userId: user.id, isPersonalRecord: true, isCompleted: true },
    orderBy: { estimated1RM: 'desc' },
    include: { exercise: { select: { name: true } } },
  });
  const seen = new Set<string>();
  const out: PersonalRecord[] = [];
  for (const s of prSets) {
    if (seen.has(s.exerciseId)) continue;
    seen.add(s.exerciseId);
    out.push({
      exerciseId: s.exerciseId,
      exerciseName: s.exercise.name,
      weight: s.weight,
      reps: s.reps,
      estimated1RM: s.estimated1RM,
      performedAt: s.performedAt.toISOString(),
    });
  }
  return out;
}

// ============================================================
// Berat badan
// ============================================================

export type BodyWeightData = {
  logs: Array<{ weight: number; recordedAt: string }>;
  trend7d: number | null;
  latest: number | null;
};

export async function getBodyWeightLogsAction(): Promise<BodyWeightData> {
  const user = await requireUser();
  const logs = await prisma.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: 'asc' },
    select: { weight: true, recordedAt: true },
    take: 365,
  });
  // Tren 7 hari: rata-rata 7 entri terakhir vs 7 sebelumnya.
  const last7 = logs.slice(-7);
  const prev7 = logs.slice(-14, -7);
  const avg = (a: { weight: number }[]) =>
    a.length ? a.reduce((s, l) => s + l.weight, 0) / a.length : 0;
  const trend7d =
    last7.length && prev7.length ? avg(last7) - avg(prev7) : null;
  return {
    logs: logs.map((l) => ({
      weight: l.weight,
      recordedAt: l.recordedAt.toISOString(),
    })),
    trend7d,
    latest: logs.length ? logs[logs.length - 1].weight : null,
  };
}

export async function logBodyWeightAction(weight: number) {
  const user = await requireUser();
  if (!(weight > 20 && weight < 300)) {
    throw new Error('Berat badan tidak wajar (20–300 kg).');
  }
  await prisma.bodyWeightLog.create({
    data: { userId: user.id, weight },
  });
  revalidatePath('/profil');
  return { success: true };
}
