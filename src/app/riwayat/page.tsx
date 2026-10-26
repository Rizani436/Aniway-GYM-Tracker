import { getRiwayatDataAction } from '@/app/actions/riwayat-actions';
import { RiwayatClient } from '@/components/riwayat/riwayat-client';
import { getAuthenticatedUser } from '@/lib/supabase/server';
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

  const user = await getAuthenticatedUser().catch(() => null);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg-strong)] px-4 pt-6">
      <RiwayatClient
        initialSessions={data.sessions}
        stats={data.stats}
        heatmapData={data.heatmapData}
        availableExercises={data.availableExercises}
        programJatuhTempo={data.programJatuhTempo}
        weightUnit={user?.weightUnit}
      />
    </main>
  );
}
