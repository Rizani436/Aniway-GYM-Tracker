'use server';

import { revalidatePath } from 'next/cache';
import { SetType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import {
  programSchema,
  programExerciseSchema,
  exerciseSchema,
  type ProgramInput,
  type ProgramExerciseInput,
  type ExerciseInput,
} from '@/lib/validations';

async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Tidak terautentikasi. Silakan login kembali.');
  }
  return user;
}

// ==================== PROGRAM ACTIONS ====================

export async function getHomeDataAction() {
  const user = await requireUser();

  // Hanya 4 round-trip DB paralel untuk seluruh halaman Home:
  // 1. program + jumlah gerakan (tanpa nested exercise full row)
  // 2. jumlah gerakan di pustaka
  // 3. sesi terakhir yang selesai (untuk tombol "Ulangi Latihan Terakhir")
  // 4. sesi selesai 14 hari terakhir (untuk rekap mingguan)
  const tanggal14HariLalu = new Date(Date.now() - 14 * 24 * 3600 * 1000);
  const [programs, exerciseCount, lastSession, recentSessions] = await Promise.all([
    prisma.program.findMany({
      where: { userId: user.id, isArchived: false },
      select: {
        id: true,
        name: true,
        color: true,
        _count: { select: { exercises: true, sessions: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.exercise.count({
      where: {
        isArchived: false,
        OR: [{ userId: null }, { userId: user.id }],
      },
    }),
    prisma.workoutSession.findFirst({
      where: { userId: user.id, isCompleted: true },
      orderBy: { startedAt: 'desc' },
      select: { id: true, name: true, startedAt: true },
    }),
    prisma.workoutSession.findMany({
      where: { userId: user.id, isCompleted: true, startedAt: { gte: tanggal14HariLalu } },
      select: { startedAt: true, totalVolume: true },
    }),
  ]);

  // Agregasi rekap mingguan: minggu ini = 7 hari terakhir, minggu lalu = 7 hari sebelumnya.
  const weekRecap = (() => {
    const now = Date.now();
    const batas7Hari = now - 7 * 24 * 3600 * 1000;
    const weeks = { thisWeek: { sessions: 0, volume: 0 }, lastWeek: { sessions: 0, volume: 0 } };
    for (const s of recentSessions) {
      const t = s.startedAt.getTime();
      if (t >= batas7Hari) {
        weeks.thisWeek.sessions += 1;
        weeks.thisWeek.volume += s.totalVolume;
      } else {
        weeks.lastWeek.sessions += 1;
        weeks.lastWeek.volume += s.totalVolume;
      }
    }
    weeks.thisWeek.volume = Math.round(weeks.thisWeek.volume);
    weeks.lastWeek.volume = Math.round(weeks.lastWeek.volume);
    return weeks;
  })();

  return {
    user: {
      name: user.name,
    },
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      exerciseCount: p._count.exercises,
      sessionCount: p._count.sessions,
    })),
    exerciseCount,
    lastSession,
    weekRecap,
  };
}

export async function getProgramsAction(includeArchived = false) {
  const user = await requireUser();

  return prisma.program.findMany({
    where: {
      userId: user.id,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercise: true,
        },
      },
      _count: {
        select: { sessions: true },
      },
    },
    orderBy: [{ isArchived: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getProgramByIdAction(programId: string) {
  const user = await requireUser();

  const program = await prisma.program.findFirst({
    where: {
      id: programId,
      userId: user.id,
    },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercise: true,
        },
      },
      _count: {
        select: { sessions: true },
      },
    },
  });

  if (!program) {
    throw new Error('Program tidak ditemukan.');
  }

  return program;
}

export async function upsertProgramAction(input: ProgramInput) {
  const user = await requireUser();
  const parsed = programSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { id, name, description, color } = parsed.data;

  if (id) {
    const existing = await prisma.program.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error('Program tidak ditemukan.');

    const updated = await prisma.program.update({
      where: { id },
      data: { name, description: description || null, color },
    });
    revalidatePath('/latihan');
    revalidatePath(`/latihan/program/${id}`);
    revalidatePath('/');
    return updated;
  } else {
    const lastProgram = await prisma.program.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: 'desc' },
    });

    const created = await prisma.program.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        color,
        sortOrder: (lastProgram?.sortOrder ?? -1) + 1,
      },
    });
    revalidatePath('/latihan');
    revalidatePath('/');
    return created;
  }
}

export async function saveSessionAsProgramAction(input: {
  sessionId: string;
  name: string;
  description?: string;
  color: string;
}) {
  const user = await requireUser();
  const parsed = programSchema.safeParse({
    name: input.name,
    description: input.description,
    color: input.color,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const session = await prisma.workoutSession.findFirst({
    where: { id: input.sessionId, userId: user.id, isCompleted: true },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' },
        include: { sets: { orderBy: { setNumber: 'asc' } } },
      },
    },
  });
  if (!session) throw new Error('Sesi tidak ditemukan.');
  if (session.exercises.length === 0) throw new Error('Sesi tidak punya gerakan.');

  const lastProgram = await prisma.program.findFirst({
    where: { userId: user.id },
    orderBy: { sortOrder: 'desc' },
  });

  // Derivasi target = aturan fitur "ulangi sesi" (workout-actions.ts:82-94):
  // targetSets = jumlah set non-WARMUP; repMin/Max = rentang reps set kerja.
  const created = await prisma.program.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color,
      sortOrder: (lastProgram?.sortOrder ?? -1) + 1,
      exercises: {
        create: session.exercises.map((se, idx) => {
          const workSets = se.sets.filter((s) => s.setType !== SetType.WARMUP);
          const workReps = workSets.filter((s) => s.reps > 0).map((s) => s.reps);
          return {
            exerciseId: se.exerciseId,
            sortOrder: idx,
            targetSets: workSets.length || 1,
            targetRepMin: workReps.length ? Math.min(...workReps) : 8,
            targetRepMax: workReps.length ? Math.max(...workReps) : 12,
            restSeconds: se.restSeconds || 90,
            notes: se.notes,
          };
        }),
      },
    },
    include: { exercises: true },
  });

  revalidatePath('/latihan');
  revalidatePath('/');
  return { programId: created.id, exerciseCount: created.exercises.length };
}

export async function toggleArchiveProgramAction(programId: string) {
  const user = await requireUser();
  const existing = await prisma.program.findFirst({
    where: { id: programId, userId: user.id },
  });

  if (!existing) throw new Error('Program tidak ditemukan.');

  const updated = await prisma.program.update({
    where: { id: programId },
    data: { isArchived: !existing.isArchived },
  });

  revalidatePath('/latihan');
  revalidatePath(`/latihan/program/${programId}`);
  revalidatePath('/');
  return updated;
}

export async function deleteProgramAction(programId: string) {
  const user = await requireUser();
  const existing = await prisma.program.findFirst({
    where: { id: programId, userId: user.id },
    include: { _count: { select: { sessions: true } } },
  });

  if (!existing) throw new Error('Program tidak ditemukan.');

  if (existing._count.sessions > 0) {
    await prisma.program.update({
      where: { id: programId },
      data: { isArchived: true },
    });
    revalidatePath('/latihan');
    revalidatePath('/');
    return { mode: 'archived' as const };
  }

  await prisma.program.delete({
    where: { id: programId },
  });

  revalidatePath('/latihan');
  revalidatePath('/');
  return { mode: 'deleted' as const };
}

export async function reorderProgramsAction(orderedIds: string[]) {
  const user = await requireUser();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.program.updateMany({
        where: { id, userId: user.id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath('/latihan');
  revalidatePath('/');
  return { success: true };
}

// ==================== PROGRAM EXERCISE ACTIONS ====================

export async function addExerciseToProgramAction(input: ProgramExerciseInput) {
  const user = await requireUser();
  const parsed = programExerciseSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const program = await prisma.program.findFirst({
    where: { id: parsed.data.programId, userId: user.id },
  });
  if (!program) throw new Error('Program tidak ditemukan.');

  const lastItem = await prisma.programExercise.findFirst({
    where: { programId: program.id },
    orderBy: { sortOrder: 'desc' },
  });

  const created = await prisma.programExercise.create({
    data: {
      programId: program.id,
      exerciseId: parsed.data.exerciseId,
      sortOrder: (lastItem?.sortOrder ?? -1) + 1,
      targetSets: parsed.data.targetSets,
      targetRepMin: parsed.data.targetRepMin,
      targetRepMax: parsed.data.targetRepMax,
      restSeconds: parsed.data.restSeconds,
      notes: parsed.data.notes || null,
    },
    include: { exercise: true },
  });

  revalidatePath(`/latihan/program/${program.id}`);
  revalidatePath('/latihan');
  revalidatePath('/');
  return created;
}

export async function updateProgramExerciseAction(
  id: string,
  data: {
    targetSets: number;
    targetRepMin: number;
    targetRepMax: number;
    restSeconds: number;
    notes?: string | null;
  }
) {
  const user = await requireUser();

  const item = await prisma.programExercise.findUnique({
    where: { id },
    include: { program: true },
  });

  if (!item || item.program.userId !== user.id) {
    throw new Error('Item program tidak ditemukan.');
  }

  if (data.targetRepMax < data.targetRepMin) {
    throw new Error('Rep maksimal tidak boleh lebih kecil dari rep minimal.');
  }

  const updated = await prisma.programExercise.update({
    where: { id },
    data: {
      targetSets: data.targetSets,
      targetRepMin: data.targetRepMin,
      targetRepMax: data.targetRepMax,
      restSeconds: data.restSeconds,
      notes: data.notes || null,
    },
  });

  revalidatePath(`/latihan/program/${item.programId}`);
  return updated;
}

export async function removeExerciseFromProgramAction(id: string) {
  const user = await requireUser();

  const item = await prisma.programExercise.findUnique({
    where: { id },
    include: { program: true },
  });

  if (!item || item.program.userId !== user.id) {
    throw new Error('Item tidak ditemukan.');
  }

  await prisma.programExercise.delete({
    where: { id },
  });

  revalidatePath(`/latihan/program/${item.programId}`);
  revalidatePath('/latihan');
  revalidatePath('/');
  return { success: true };
}

export async function reorderProgramExercisesAction(
  programId: string,
  orderedProgramExerciseIds: string[]
) {
  const user = await requireUser();

  const program = await prisma.program.findFirst({
    where: { id: programId, userId: user.id },
  });
  if (!program) throw new Error('Program tidak ditemukan.');

  await prisma.$transaction([
    ...orderedProgramExerciseIds.map((id, idx) =>
      prisma.programExercise.update({
        where: { id },
        data: { sortOrder: 1000 + idx },
      })
    ),
    ...orderedProgramExerciseIds.map((id, idx) =>
      prisma.programExercise.update({
        where: { id },
        data: { sortOrder: idx },
      })
    ),
  ]);

  revalidatePath(`/latihan/program/${programId}`);
  return { success: true };
}

// ==================== PUSTAKA GERAKAN (EXERCISE) ACTIONS ====================

export async function getExercisesAction(includeArchived = false) {
  const user = await requireUser();

  return prisma.exercise.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: {
      programExercises: {
        where: {
          program: { userId: user.id, isArchived: false },
        },
        include: {
          program: {
            select: { id: true, name: true, color: true },
          },
        },
      },
    },
    orderBy: [{ isCustom: 'desc' }, { name: 'asc' }],
  });
}

export async function getExerciseByIdAction(exerciseId: string) {
  const user = await requireUser();

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      OR: [{ userId: null }, { userId: user.id }],
    },
    include: {
      programExercises: {
        where: {
          program: { userId: user.id, isArchived: false },
        },
        include: {
          program: {
            select: { id: true, name: true, color: true },
          },
        },
      },
      _count: {
        select: {
          sessionExercises: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Gerakan tidak ditemukan.');
  }

  return exercise;
}

export async function upsertExerciseAction(
  input: ExerciseInput,
  attachToProgramId?: string
) {
  const user = await requireUser();
  const parsed = exerciseSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const dataPayload = {
    name: parsed.data.name,
    primaryMuscle: parsed.data.primaryMuscle,
    secondaryMuscles: parsed.data.secondaryMuscles,
    equipment: parsed.data.equipment,
    weightIncrement: parsed.data.weightIncrement,
    steps: parsed.data.steps,
    tips: parsed.data.tips,
    commonMistakes: parsed.data.commonMistakes,
    videoUrl: parsed.data.videoUrl || null,
    imageUrl: parsed.data.imageUrl || null,
    alternatives: parsed.data.alternatives,
  };

  let savedExercise;

  if (parsed.data.id) {
    const existing = await prisma.exercise.findFirst({
      where: {
        id: parsed.data.id,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });

    if (!existing) throw new Error('Gerakan tidak ditemukan.');

    if (existing.userId === user.id) {
      savedExercise = await prisma.exercise.update({
        where: { id: existing.id },
        data: dataPayload,
      });
    } else {
      savedExercise = await prisma.exercise.create({
        data: {
          ...dataPayload,
          userId: user.id,
          isCustom: true,
        },
      });

      await prisma.programExercise.updateMany({
        where: {
          exerciseId: existing.id,
          program: { userId: user.id },
        },
        data: {
          exerciseId: savedExercise.id,
        },
      });
    }
  } else {
    savedExercise = await prisma.exercise.create({
      data: {
        ...dataPayload,
        userId: user.id,
        isCustom: true,
      },
    });

    if (attachToProgramId) {
      const program = await prisma.program.findFirst({
        where: { id: attachToProgramId, userId: user.id },
      });

      if (program) {
        const lastOrder = await prisma.programExercise.findFirst({
          where: { programId: program.id },
          orderBy: { sortOrder: 'desc' },
        });

        await prisma.programExercise.create({
          data: {
            programId: program.id,
            exerciseId: savedExercise.id,
            sortOrder: (lastOrder?.sortOrder ?? -1) + 1,
            targetSets: 3,
            targetRepMin: 8,
            targetRepMax: 12,
            restSeconds: user.defaultRestTimer || 90,
          },
        });
        revalidatePath(`/latihan/program/${program.id}`);
      }
    }
  }

  revalidatePath('/latihan');
  revalidatePath(`/latihan/gerakan/${savedExercise.id}`);
  return savedExercise;
}

export async function toggleArchiveExerciseAction(exerciseId: string) {
  const user = await requireUser();
  const existing = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: user.id },
  });

  if (!existing) {
    throw new Error('Hanya gerakan kustom milik Anda yang dapat diarsipkan.');
  }

  const updated = await prisma.exercise.update({
    where: { id: exerciseId },
    data: { isArchived: !existing.isArchived },
  });

  revalidatePath('/latihan');
  revalidatePath(`/latihan/gerakan/${exerciseId}`);
  return updated;
}

export async function deleteExerciseAction(exerciseId: string) {
  const user = await requireUser();
  const existing = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: user.id },
    include: {
      _count: {
        select: { sessionExercises: true, programExercises: true },
      },
    },
  });

  if (!existing) {
    throw new Error('Hanya gerakan kustom milik Anda yang dapat dihapus.');
  }

  if (existing._count.sessionExercises > 0) {
    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { isArchived: true },
    });
    revalidatePath('/latihan');
    return { mode: 'archived' as const };
  }

  await prisma.programExercise.deleteMany({
    where: { exerciseId },
  });

  await prisma.exercise.delete({
    where: { id: exerciseId },
  });

  revalidatePath('/latihan');
  return { mode: 'deleted' as const };
}
