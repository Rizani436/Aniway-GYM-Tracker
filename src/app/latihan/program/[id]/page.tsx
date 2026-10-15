import { notFound } from 'next/navigation';
import {
  getProgramByIdAction,
  getExercisesAction,
} from '@/app/actions/latihan-actions';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { ProgramDetailClient } from '@/components/latihan/program-detail-client';

export const dynamic = 'force-dynamic';

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [program, allExercises, user] = await Promise.all([
      getProgramByIdAction(id),
      getExercisesAction(false),
      getAuthenticatedUser(),
    ]);

    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 max-w-md mx-auto px-4 pt-5">
        <ProgramDetailClient
          initialProgram={program}
          allExercises={allExercises}
          userId={user?.id ?? ''}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
