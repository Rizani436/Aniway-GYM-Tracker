import { notFound } from 'next/navigation';
import { getExerciseByIdAction } from '@/app/actions/latihan-actions';
import {
  getExerciseProgressAction,
  type ProgressPoint,
} from '@/app/actions/statistik-actions';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { ExerciseDetailClient } from '@/components/latihan/exercise-detail-client';

export const dynamic = 'force-dynamic';

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    // userId diperlukan modal edit gerakan agar bisa upload foto ke Supabase Storage
    // (path objek = <userId>/<timestamp>.<ext>). Tanpa ini, tombol "Pilih Foto"
    // ditolak sebelum sempat mengunggah.
    const [exercise, progress, user] = await Promise.all([
      getExerciseByIdAction(id),
      getExerciseProgressAction(id).catch(() => [] as ProgressPoint[]),
      getAuthenticatedUser(),
    ]);
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 max-w-md mx-auto px-4 pt-5">
        <ExerciseDetailClient
          initialExercise={exercise}
          progress={progress}
          userId={user?.id ?? ''}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
