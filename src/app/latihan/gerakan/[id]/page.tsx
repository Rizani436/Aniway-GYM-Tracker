import { notFound } from 'next/navigation';
import { getExerciseByIdAction } from '@/app/actions/latihan-actions';
import { ExerciseDetailClient } from '@/components/latihan/exercise-detail-client';

export const dynamic = 'force-dynamic';

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const exercise = await getExerciseByIdAction(id);
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 max-w-md mx-auto px-4 pt-5">
        <ExerciseDetailClient initialExercise={exercise} />
      </main>
    );
  } catch {
    notFound();
  }
}
