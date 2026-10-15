import Link from 'next/link';
import { ChevronLeft, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getPersonalRecordsAction } from '@/app/actions/statistik-actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PR Saya | Aniway',
};

export default async function PersonalRecordsPage() {
  let prs: Awaited<ReturnType<typeof getPersonalRecordsAction>> = [];
  try {
    prs = await getPersonalRecordsAction();
  } catch {
    prs = [];
  }

  return (
    <main className="min-h-screen bg-[#08090a] text-[#f7f8f8] pb-28 max-w-md mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/riwayat"
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300"
          aria-label="Kembali ke riwayat"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">PR Saya</h1>
      </div>

      {prs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <Trophy className="w-12 h-12 text-zinc-600" />
          <p className="text-xs text-zinc-400 max-w-[260px]">
            Belum ada PR — tercatat otomatis saat kamu pecah rekor di mode workout.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {prs.map((pr) => (
            <Link
              key={pr.exerciseId}
              href={`/latihan/gerakan/${pr.exerciseId}`}
              className="block bg-white/[0.03] border border-white/[0.08] rounded-2xl p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm">{pr.exerciseName}</p>
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-zinc-400">
                  {pr.weight} kg × {pr.reps} reps
                </p>
                <p className="text-xs font-mono text-emerald-400 tabular-nums">
                  {pr.estimated1RM.toFixed(1)} <span className="text-[10px] text-zinc-500">1RM est</span>
                </p>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                {format(new Date(pr.performedAt), 'd MMM yyyy', { locale: id })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
