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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-4">
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
