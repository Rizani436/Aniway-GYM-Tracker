'use client';

import { useState, useTransition } from 'react';
import { Dumbbell } from 'lucide-react';
import { getMuscleVolumeAction } from '@/app/actions/statistik-actions';
import type { MuscleVolume } from '@/app/actions/statistik-actions';
import { MUSCLE_LABELS } from '@/lib/constants';

const PERIODES = [7, 30] as const;

export function MuscleVolumeCard({ initialData }: { initialData: MuscleVolume[] }) {
  const [days, setDays] = useState<7 | 30>(7);
  const [data, setData] = useState<MuscleVolume[]>(initialData);
  const [isPending, startTransition] = useTransition();

  function switchPeriod(next: 7 | 30) {
    if (next === days) return;
    setDays(next);
    startTransition(() => {
      getMuscleVolumeAction(next).then(setData);
    });
  }

  return (
    <div
      className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] transition-opacity ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      <CardHeader days={days} onSwitch={switchPeriod} />
      {!data.length ? (
        <p className="text-xs text-zinc-400 text-center py-6">
          Belum ada latihan dalam {days} hari terakhir
        </p>
      ) : (
        <div className="space-y-2.5 mt-1">
          {toRows(data).map((r) => (
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
                  className="h-full rounded-full bg-emerald-500/80 transition-all"
                  style={{ width: `${Math.max((r.volume / r.maxVolume) * 100, 2)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{r.sets} set</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeriodChip({
  value,
  active,
  onSwitch,
}: {
  value: 7 | 30;
  active: boolean;
  onSwitch: (next: 7 | 30) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSwitch(value)}
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-white/[0.05] text-zinc-500 border border-transparent hover:text-zinc-300'
      }`}
    >
      {value} Hari
    </button>
  );
}

function CardHeader({
  days,
  onSwitch,
}: {
  days: 7 | 30;
  onSwitch: (next: 7 | 30) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
      <Dumbbell className="w-4 h-4 text-emerald-400" />
      <span className="truncate">Volume {days} Hari Terakhir</span>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        {PERIODES.map((p) => (
          <PeriodChip key={p} value={p} active={days === p} onSwitch={onSwitch} />
        ))}
      </div>
    </div>
  );
}

// Max 8 otot, sisanya digabung "Lainnya".
function toRows(data: MuscleVolume[]) {
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
  return rows.map((r) => ({ ...r, maxVolume }));
}
