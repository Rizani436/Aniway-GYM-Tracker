import { getWorkoutInitialDataAction } from '@/app/actions/workout-actions';
import { WorkoutRunner } from '@/components/workout/workout-runner';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mode Workout Aktif | Aniway',
  description: 'Catat sesi latihan gym aktif dengan timer istirahat, stepper beban, dan deteksi PR otomatis.',
};

interface PageProps {
  searchParams: Promise<{ programId?: string; repeatSessionId?: string }>;
}

export default async function WorkoutPage({ searchParams }: PageProps) {
  const { programId, repeatSessionId } = await searchParams;

  // JANGAN redirect ke /login saat gagal: halaman ini harus tetap tampil offline
  // (tempat gym sering tanpa sinyal). Runner akan memakai snapshot perangkat.
  const initialData = await getWorkoutInitialDataAction(programId, repeatSessionId).catch(() => null);

  return (
    <main className="min-h-[100dvh] bg-[#08090a] text-[#f7f8f8] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <WorkoutRunner
        user={initialData?.user ?? null}
        initialProgram={initialData?.selectedProgram ?? null}
        userPrograms={initialData?.userPrograms ?? []}
        availableExercises={(initialData?.availableExercises ?? []) as any}
        initialHistoryMap={initialData?.historyMap ?? {}}
        serverReachable={initialData !== null}
      />
    </main>
  );
}
