import {
  getProgramsAction,
  getExercisesAction,
} from '@/app/actions/latihan-actions';
import { LatihanTabsClient } from '@/components/latihan/latihan-tabs-client';

export const dynamic = 'force-dynamic';

export default async function LatihanPage() {
  const [programs, exercises] = await Promise.all([
    getProgramsAction(true),
    getExercisesAction(false),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 max-w-md mx-auto px-4 pt-6">
      <LatihanTabsClient
        initialPrograms={programs}
        initialExercises={exercises}
      />
    </main>
  );
}
