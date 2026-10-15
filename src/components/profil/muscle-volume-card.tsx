import { Dumbbell } from 'lucide-react';
import type { MuscleVolume } from '@/app/actions/statistik-actions';
import { MUSCLE_LABELS } from '@/lib/constants';

export function MuscleVolumeCard({ data }: { data: MuscleVolume[] }) {
  if (!data.length) {
    return (
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <CardHeader />
        <p className="text-xs text-zinc-400 text-center py-6">
          Belum ada latihan dalam 7 hari terakhir
        </p>
      </div>
    );
  }

  // Max 8 otot, sisanya digabung "Lainnya".
  const top = data.slice(0, 8);
  const rest = data.slice(8);
  const rows = rest.length
    ? [
        ...top,
        {
          muscle: 'Lainnya',
          volume: rest.reduce((s, r) => s + r.volume, 0),
          sets: rest.reduce((s, r) => s + r.sets, 0),
        },
      ]
    : top;
  const maxVolume = Math.max(...rows.map((r) => r.volume));

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <CardHeader />
      <div className="space-y-2.5 mt-1">
        {rows.map((r) => (
          <div key={r.muscle}>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {MUSCLE_LABELS[r.muscle] ?? r.muscle}
              </span>
              <span className="text-xs font-bold tabular-nums text-white shrink-0">
                {r.volume.toLocaleString('id-ID')}
                <span className="text-zinc-400 font-medium"> kg</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500/80"
                style={{ width: `${Math.max((r.volume / maxVolume) * 100, 2)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">{r.sets} set</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardHeader() {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
      <Dumbbell className="w-4 h-4 text-emerald-400" />
      <span>Volume per Otot</span>
      <span className="ml-auto text-[10px] font-medium text-zinc-500">7 hari</span>
    </div>
  );
}
