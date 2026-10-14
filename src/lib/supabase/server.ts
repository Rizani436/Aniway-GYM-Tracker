import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Diabaikan jika dipanggil dari Server Component murni
          }
        },
      },
    }
  );
}

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return null;
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split('@')[0],
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
    create: {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split('@')[0],
      avatarUrl: user.user_metadata?.avatar_url || null,
    },
  });

  return dbUser;
}
