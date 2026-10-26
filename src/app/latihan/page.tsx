import {
  getProgramsAction,
  getExercisesAction,
} from '@/app/actions/latihan-actions';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { LatihanTabsClient } from '@/components/latihan/latihan-tabs-client';

export const dynamic = 'force-dynamic';

export default async function LatihanPage() {
  const [programs, exercises, user] = await Promise.all([
    getProgramsAction(true),
    getExercisesAction(false),
    getAuthenticatedUser(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg-strong)] pb-24 max-w-md mx-auto px-4 pt-6">
      <LatihanTabsClient
        initialPrograms={programs}
        initialExercises={exercises}
        userId={user?.id ?? ''}
        weightUnit={user?.weightUnit}
      />
    </main>
  );
}
