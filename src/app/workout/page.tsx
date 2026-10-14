import { getWorkoutInitialDataAction } from '@/app/actions/workout-actions';
import { WorkoutRunner } from '@/components/workout/workout-runner';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mode Workout Aktif | Aniway',
  description: 'Catat sesi latihan gym aktif dengan timer istirahat, stepper beban, dan deteksi PR otomatis.',
};

interface PageProps {
  searchParams: Promise<{
    programId?: string;
  }>;
}

export default async function WorkoutPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const programId = resolvedParams.programId;

  let initialData;
  try {
    initialData = await getWorkoutInitialDataAction(programId);
  } catch {
    redirect('/login');
  }

  return (
    <main className="min-h-[100dvh] bg-[#08090a] text-[#f7f8f8] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <WorkoutRunner
        user={initialData.user}
        initialProgram={initialData.selectedProgram}
        userPrograms={initialData.userPrograms}
        availableExercises={initialData.availableExercises as any}
        initialHistoryMap={initialData.historyMap}
      />
    </main>
  );
}
