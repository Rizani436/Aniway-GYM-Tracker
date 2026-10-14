'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().optional(),
});

export async function loginWithEmail(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: 'Email atau password salah.' };
  }

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: { email: data.user.email! },
    create: {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
    },
  });

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signupWithEmail(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name || parsed.data.email.split('@')[0],
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && data.user.email) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: {
        email: data.user.email,
        name: parsed.data.name || data.user.email.split('@')[0],
      },
      create: {
        id: data.user.id,
        email: data.user.email,
        name: parsed.data.name || data.user.email.split('@')[0],
      },
    });
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
