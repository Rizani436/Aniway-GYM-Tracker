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
  //
  // TAPI dua sebab kegagalan harus dibedakan, karena gejalanya dulu tertukar:
  //  - benar-benar offline -> snapshot perangkat dipakai (wajar, tanpa pesan)
  //  - server/DB gagal (mis. query timeout P1001) -> JANGAN diam-diam tampilkan
  //    "Belum Ada Gerakan". Dulu itu yang terjadi: user membuka program dari URL,
  //    programnya jelas berisi 5-10 gerakan, tapi yang muncul kotak kosong —
  //    karena action gagal, halaman menelan error, runner masuk mode offline, dan
  //    snapshot perangkat kosong. Sekarang kegagalan server dikirim eksplisit
  //    (`initFailed`) supaya runner menampilkan pesan jujur + tombol coba lagi.
  let initialData: Awaited<ReturnType<typeof getWorkoutInitialDataAction>> | null = null;
  let initFailed = false;
  try {
    initialData = await getWorkoutInitialDataAction(programId, repeatSessionId);
  } catch (err) {
    initFailed = true;
    console.error(
      '[workout] gagal memuat data awal:',
      (err as { code?: string })?.code || '',
      (err as Error)?.message || err
    );
  }

  const serverReachable = !initFailed;

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--fg)] px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <WorkoutRunner
        user={initialData?.user ?? null}
        initialProgram={initialData?.selectedProgram ?? null}
        userPrograms={initialData?.userPrograms ?? []}
        availableExercises={(initialData?.availableExercises ?? []) as any}
        initialHistoryMap={initialData?.historyMap ?? {}}
        serverReachable={serverReachable}
        initFailed={initFailed}
        requestedProgramId={programId ?? null}
      />
    </main>
  );
}
