import { z } from 'zod';
import { MuscleGroup, EquipmentType, SetType } from '@prisma/client';

export const programSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Nama program minimal 2 karakter')
    .max(50, 'Nama program maksimal 50 karakter'),
  description: z
    .string()
    .trim()
    .max(200, 'Deskripsi maksimal 200 karakter')
    .optional()
    .nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid'),
});

export const programExerciseSchema = z
  .object({
    programId: z.string().min(1),
    exerciseId: z.string().min(1, 'Pilih gerakan terlebih dahulu'),
    targetSets: z.coerce
      .number()
      .int()
      .min(1, 'Minimal 1 set')
      .max(20, 'Maksimal 20 set'),
    targetRepMin: z.coerce
      .number()
      .int()
      .min(1, 'Minimal 1 repetisi')
      .max(100, 'Maksimal 100 repetisi'),
    targetRepMax: z.coerce
      .number()
      .int()
      .min(1, 'Minimal 1 repetisi')
      .max(100, 'Maksimal 100 repetisi'),
    restSeconds: z.coerce
      .number()
      .int()
      .min(10, 'Minimal 10 detik')
      .max(600, 'Maksimal 600 detik'),
    notes: z.string().max(250).optional().nullable(),
  })
  .refine((data) => data.targetRepMax >= data.targetRepMin, {
    message: 'Target rep maksimal harus lebih besar atau sama dengan rep minimal',
    path: ['targetRepMax'],
  });

export const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Nama gerakan minimal 2 karakter')
    .max(80, 'Nama gerakan maksimal 80 karakter'),
  primaryMuscle: z.nativeEnum(MuscleGroup),
  secondaryMuscles: z.array(z.nativeEnum(MuscleGroup)).default([]),
  equipment: z.nativeEnum(EquipmentType),
  weightIncrement: z.coerce
    .number()
    .min(0.5, 'Minimal kenaikan beban 0.5')
    .max(50, 'Maksimal kenaikan beban 50'),
  steps: z
    .array(z.string().trim().min(1))
    .min(1, 'Masukkan minimal 1 langkah gerakan'),
  tips: z.array(z.string().trim().min(1)).default([]),
  commonMistakes: z.array(z.string().trim().min(1)).default([]),
  videoUrl: z
    .string()
    .trim()
    .url('URL video tidak valid')
    .optional()
    .or(z.literal('')),
  alternatives: z.array(z.string().trim().min(1)).default([]),
});

export type ProgramInput = z.infer<typeof programSchema>;
export type ProgramExerciseInput = z.infer<typeof programExerciseSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;

export const workoutSetSchema = z.object({
  id: z.string().optional(),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0, 'Beban tidak boleh negatif'),
  reps: z.number().int().min(0, 'Repetisi tidak boleh negatif'),
  setType: z.nativeEnum(SetType).default(SetType.NORMAL),
  rpe: z.number().min(1).max(10).optional().nullable(),
  isCompleted: z.boolean().default(false),
});

export const sessionExerciseInputSchema = z.object({
  exerciseId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  restSeconds: z.number().int().default(90),
  notes: z.string().max(300).optional().nullable(),
  sets: z.array(workoutSetSchema).min(1, 'Minimal 1 set'),
});

export const saveWorkoutSessionSchema = z.object({
  id: z.string().optional(),
  programId: z.string().optional().nullable(),
  name: z.string().trim().min(1, 'Nama sesi tidak boleh kosong').max(80),
  startedAt: z.string().or(z.date()),
  endedAt: z.string().or(z.date()).optional().nullable(),
  durationSec: z.number().int().min(0).default(0),
  notes: z.string().max(500).optional().nullable(),
  exercises: z.array(sessionExerciseInputSchema),
});

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
export type SessionExerciseInput = z.infer<typeof sessionExerciseInputSchema>;
export type SaveWorkoutSessionInput = z.infer<typeof saveWorkoutSessionSchema>;

