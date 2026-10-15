'use client';

import { memo, useState } from 'react';
import { SetType } from '@prisma/client';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const RPE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface SetRowData {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  setType: SetType;
  rpe?: number | null;
  isCompleted: boolean;
  previousRecord?: {
    weight: number;
    reps: number;
  } | null;
}

interface ExerciseSetRowProps {
  set: SetRowData;
  index: number;
  weightIncrement: number;
  onChange: (updated: Partial<SetRowData>) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export const ExerciseSetRow = memo(function ExerciseSetRow({
  set,
  index,
  weightIncrement,
  onChange,
  onToggleComplete,
  onDelete,
  canDelete,
}: ExerciseSetRowProps) {
  const [isRpeOpen, setIsRpeOpen] = useState(false);

  const cycleSetType = () => {
    const types: SetType[] = [SetType.NORMAL, SetType.WARMUP, SetType.DROPSET, SetType.FAILURE];
    const currentIndex = types.indexOf(set.setType);
    const nextType = types[(currentIndex + 1) % types.length];
    onChange({ setType: nextType });
  };

  const getSetTypeBadge = () => {
    switch (set.setType) {
      case SetType.WARMUP:
        return <span className="text-amber-300 font-black">W</span>;
      case SetType.DROPSET:
        return <span className="text-purple-300 font-black">D</span>;
      case SetType.FAILURE:
        return <span className="text-rose-300 font-black">F</span>;
      default:
        return <span className="font-bold">{index + 1}</span>;
    }
  };

  const stepWeight = (direction: 1 | -1) => {
    const current = Number(set.weight) || 0;
    const step = weightIncrement || 2.5;
    const next = Math.max(0, Math.round((current + direction * step) * 10) / 10);
    onChange({ weight: next });
  };

  const stepReps = (direction: 1 | -1) => {
    const current = Number(set.reps) || 0;
    const next = Math.max(0, current + direction);
    onChange({ reps: next });
  };

  return (
    <div
      className={cn(
        'group flex flex-wrap items-center gap-1 py-1.5 px-1.5 rounded-xl transition-colors duration-150 border',
        set.isCompleted
          ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-100'
          : 'bg-white/[0.03] border-white/[0.07] text-zinc-200'
      )}
    >
      {/* Set Number / Set Type Badge — tap area besar untuk ganti jenis set */}
      <button
        type="button"
        onClick={cycleSetType}
        className={cn(
          'w-8 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-transform active:scale-90 select-none shrink-0 touch-manipulation',
          set.setType === SetType.WARMUP && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          set.setType === SetType.DROPSET && 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
          set.setType === SetType.FAILURE && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
          set.setType === SetType.NORMAL && 'bg-white/[0.06] text-zinc-300'
        )}
        title="Klik untuk ganti jenis set (1 = Normal, W = Warmup, D = Dropset, F = Failure)"
      >
        {getSetTypeBadge()}
      </button>

      {/* Sesi Lalu (Ghost Reference) */}
      <div className="w-12 text-center shrink-0 hidden xs:block sm:block">
        {set.previousRecord ? (
          <span className="text-[10px] font-mono text-zinc-400 font-medium truncate block leading-tight">
            {set.previousRecord.weight}×{set.previousRecord.reps}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-zinc-600">—</span>
        )}
      </div>

      {/* Beban (KG) + Quick Steppers — thumb friendly 44px zone */}
      <div className="flex-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => stepWeight(-1)}
          className="w-8 h-9 rounded-lg bg-white/[0.05] text-zinc-300 flex items-center justify-center active:scale-90 active:bg-white/[0.12] shrink-0 transition-transform touch-manipulation"
          aria-label="Kurangi beban"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          step={weightIncrement || 2.5}
          min="0"
          inputMode="decimal"
          value={set.weight === 0 ? '' : set.weight}
          placeholder="0"
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange({ weight: isNaN(val) ? 0 : val });
          }}
          className="w-full min-w-0 h-9 text-center bg-black/40 border border-white/[0.08] rounded-lg text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
        />
        <button
          type="button"
          onClick={() => stepWeight(1)}
          className="w-8 h-9 rounded-lg bg-white/[0.05] text-zinc-300 flex items-center justify-center active:scale-90 active:bg-white/[0.12] shrink-0 transition-transform touch-manipulation"
          aria-label="Tambah beban"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Repetisi (Reps) + Quick Steppers */}
      <div className="flex-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => stepReps(-1)}
          className="w-8 h-9 rounded-lg bg-white/[0.05] text-zinc-300 flex items-center justify-center active:scale-90 active:bg-white/[0.12] shrink-0 transition-transform touch-manipulation"
          aria-label="Kurangi repetisi"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          value={set.reps === 0 ? '' : set.reps}
          placeholder="0"
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChange({ reps: isNaN(val) ? 0 : val });
          }}
          className="w-full min-w-0 h-9 text-center bg-black/40 border border-white/[0.08] rounded-lg text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
        />
        <button
          type="button"
          onClick={() => stepReps(1)}
          className="w-8 h-9 rounded-lg bg-white/[0.05] text-zinc-300 flex items-center justify-center active:scale-90 active:bg-white/[0.12] shrink-0 transition-transform touch-manipulation"
          aria-label="Tambah repetisi"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RPE + tombol centang */}
      <button
        type="button"
        onClick={() => setIsRpeOpen((v) => !v)}
        className={cn(
          'h-9 px-1.5 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center shrink-0 transition-transform active:scale-90 touch-manipulation',
          set.rpe
            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
            : 'bg-white/[0.06] text-zinc-500 border border-transparent'
        )}
        title="RPE — tingkat kesulitan set (1–10)"
        aria-label={set.rpe ? `RPE ${set.rpe}, ubah` : 'Set RPE'}
      >
        {set.rpe ? `R${set.rpe}` : 'RPE'}
      </button>

      {/* Tombol Centang Selesai — glow saat aktif */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 touch-manipulation',
          set.isCompleted
            ? 'bg-emerald-400 text-zinc-950 shadow-[0_0_14px_rgba(52,211,153,0.55)]'
            : 'bg-white/[0.06] text-zinc-400'
        )}
        title={set.isCompleted ? 'Batalkan selesai' : 'Tandai set selesai'}
        aria-label={set.isCompleted ? 'Batalkan selesai' : 'Tandai set selesai'}
      >
        <Check className={cn('w-4.5 h-4.5 stroke-[3]', set.isCompleted && 'scale-110')} />
      </button>

      {/* Hapus Baris Set */}
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-9 text-zinc-600 flex items-center justify-center active:text-rose-400 shrink-0 transition-colors touch-manipulation"
          title="Hapus set ini"
          aria-label="Hapus set ini"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Popover RPE — grid 1–10 + kosongkan; flex-wrap + w-full = baris baru penuh lebar */}
      {isRpeOpen && (
        <div className="w-full pt-1.5 pb-1">
          <div className="grid grid-cols-5 gap-1.5 p-2 bg-black/40 border border-white/[0.08] rounded-xl">
            {RPE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  onChange({ rpe: n });
                  setIsRpeOpen(false);
                }}
                className={cn(
                  'h-9 rounded-lg text-xs font-bold font-mono transition-colors touch-manipulation',
                  set.rpe === n
                    ? 'bg-sky-500 text-zinc-950'
                    : 'bg-white/[0.06] text-zinc-300 active:bg-white/[0.14]'
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onChange({ rpe: null });
                setIsRpeOpen(false);
              }}
              className="h-9 rounded-lg text-[10px] font-bold bg-white/[0.04] text-zinc-500 active:bg-white/[0.1] touch-manipulation"
            >
              Kosong
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
