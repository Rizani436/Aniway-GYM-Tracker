import Link from 'next/link';
import { ChevronLeft, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getPersonalRecordsAction } from '@/app/actions/statistik-actions';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { toDisplayWeight, roundWeight, weightUnitLabel } from '@/lib/units';

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

  const user = await getAuthenticatedUser().catch(() => null);
  const unitLabel = weightUnitLabel(user?.weightUnit);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 max-w-md mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/riwayat"
          className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-soft)]"
          aria-label="Kembali ke riwayat"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">PR Saya</h1>
      </div>

      {prs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <Trophy className="w-12 h-12 text-[var(--muted-strong)]" />
          <p className="text-xs text-[var(--muted)] max-w-[260px]">
            Belum ada PR — tercatat otomatis saat kamu pecah rekor di mode workout.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {prs.map((pr) => (
            <Link
              key={pr.exerciseId}
              href={`/latihan/gerakan/${pr.exerciseId}`}
              className="block bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm">{pr.exerciseName}</p>
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-[var(--muted)]">
                  {roundWeight(pr.weight, user?.weightUnit)} {unitLabel} × {pr.reps} reps
                </p>
                <p className="text-xs font-mono text-emerald-400 tabular-nums">
                  {toDisplayWeight(pr.estimated1RM, user?.weightUnit).toFixed(1)} <span className="text-[10px] text-[var(--muted-strong)]">1RM est</span>
                </p>
              </div>
              <p className="text-[10px] text-[var(--muted-strong)] mt-1">
                {format(new Date(pr.performedAt), 'd MMM yyyy', { locale: id })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
