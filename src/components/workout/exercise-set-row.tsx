'use client';

import { memo } from 'react';
import { SetType } from '@prisma/client';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'group flex items-center gap-1 py-1.5 px-1.5 rounded-xl transition-colors duration-150 border',
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
    </div>
  );
});
