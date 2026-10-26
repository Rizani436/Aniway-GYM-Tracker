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
    // .catch(() => null): DB sering putus sesaat — kegagalan mengambil user TIDAK
    // boleh melempar ke catch halaman, karena catch di sini menghasilkan notFound()
    // sehingga halaman gerakan jadi 404 padahal datanya ada.
    const [exercise, progress, user] = await Promise.all([
      getExerciseByIdAction(id),
      getExerciseProgressAction(id).catch(() => [] as ProgressPoint[]),
      getAuthenticatedUser().catch(() => null),
    ]);
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--fg-strong)] pb-28 max-w-md mx-auto px-4 pt-5">
        <ExerciseDetailClient
          initialExercise={exercise}
          progress={progress}
          userId={user?.id ?? ''}
          weightUnit={user?.weightUnit}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
