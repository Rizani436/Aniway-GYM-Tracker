import { getRiwayatDataAction } from '@/app/actions/riwayat-actions';
import { RiwayatClient } from '@/components/riwayat/riwayat-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Riwayat & Kalender Latihan | Aniway',
  description: 'Daftar riwayat sesi latihan, kalender heatmap aktivitas, penghitung streak, dan detail angkatan gym.',
};

export default async function RiwayatPage() {
  let data;
  try {
    data = await getRiwayatDataAction();
  } catch {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-6">
      <RiwayatClient
        initialSessions={data.sessions}
        stats={data.stats}
        heatmapData={data.heatmapData}
        availableExercises={data.availableExercises}
        programJatuhTempo={data.programJatuhTempo}
      />
    </main>
  );
}
