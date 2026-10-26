'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { WeightUnit, ThemeMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';

const settingsSchema = z.object({
  weightUnit: z.nativeEnum(WeightUnit),
  defaultRestTimer: z.coerce
    .number()
    .int('Timer istirahat harus bilangan bulat')
    .min(10, 'Minimal 10 detik')
    .max(600, 'Maksimal 600 detik'),
  theme: z.nativeEnum(ThemeMode),
});

export type UserSettingsInput = z.infer<typeof settingsSchema>;

/**
 * Perbarui preferensi latihan user: satuan berat, durasi istirahat default,
 * dan tema tampilan. Dipanggil dari kartu Pengaturan di halaman Profil.
 */
export async function updateUserSettingsAction(input: UserSettingsInput) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Tidak terautentikasi. Silakan login kembali.');
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      weightUnit: parsed.data.weightUnit,
      defaultRestTimer: parsed.data.defaultRestTimer,
      theme: parsed.data.theme,
    },
  });

  // Tema ikut mempengaruhi root layout (<html>), jadi revalidate layout juga.
  revalidatePath('/', 'layout');
  revalidatePath('/profil');
  revalidatePath('/workout');

  return {
    success: true,
    weightUnit: updated.weightUnit,
    defaultRestTimer: updated.defaultRestTimer,
    theme: updated.theme,
  };
}
