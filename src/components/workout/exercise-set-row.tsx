'use client';

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

export function ExerciseSetRow({
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
        return <span className="text-amber-400 font-bold">W</span>;
      case SetType.DROPSET:
        return <span className="text-purple-400 font-bold">D</span>;
      case SetType.FAILURE:
        return <span className="text-rose-400 font-bold">F</span>;
      default:
        return <span>{index + 1}</span>;
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
        'group flex items-center gap-1.5 py-1.5 px-2 rounded-xl transition-colors border',
        set.isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
      )}
    >
      {/* Set Number / Set Type Badge */}
      <button
        type="button"
        onClick={cycleSetType}
        className={cn(
          'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-transform active:scale-90 select-none shrink-0',
          set.setType === SetType.WARMUP && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          set.setType === SetType.DROPSET && 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
          set.setType === SetType.FAILURE && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
          set.setType === SetType.NORMAL && 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        )}
        title="Klik untuk ubah jenis set (Normal/Warmup/Dropset/Failure)"
      >
        {getSetTypeBadge()}
      </button>

      {/* Sesi Lalu (Ghost Reference) */}
      <div className="w-14 text-center shrink-0">
        {set.previousRecord ? (
          <span className="text-[11px] font-mono text-zinc-500 truncate block">
            {set.previousRecord.weight}k × {set.previousRecord.reps}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-zinc-600">—</span>
        )}
      </div>

      {/* Beban (KG) + Quick Steppers */}
      <div className="flex-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => stepWeight(-1)}
          className="w-6 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center active:scale-90 shrink-0"
        >
          <Minus className="w-3 h-3" />
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
          className="w-full h-8 text-center bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm font-semibold font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={() => stepWeight(1)}
          className="w-6 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center active:scale-90 shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Repetisi (Reps) + Quick Steppers */}
      <div className="flex-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => stepReps(-1)}
          className="w-6 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center active:scale-90 shrink-0"
        >
          <Minus className="w-3 h-3" />
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
          className="w-full h-8 text-center bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm font-semibold font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={() => stepReps(1)}
          className="w-6 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center active:scale-90 shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Tombol Centang Selesai */}
      <button
        type="button"
        onClick={onToggleComplete}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 shrink-0',
          set.isCompleted
            ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
        )}
        title={set.isCompleted ? 'Batalkan selesai' : 'Tandai set selesai'}
      >
        <Check className={cn('w-4 h-4 stroke-[2.5]', set.isCompleted && 'stroke-[3]')} />
      </button>

      {/* Hapus Baris Set */}
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-6 h-8 text-zinc-600 hover:text-rose-400 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity shrink-0"
          title="Hapus set ini"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
