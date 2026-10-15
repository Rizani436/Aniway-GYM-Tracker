'use client';

import { useState, useMemo } from 'react';
import { MuscleGroup, EquipmentType } from '@prisma/client';
import { Search, X, Dumbbell, Replace } from 'lucide-react';
import { MUSCLE_TRANSLATIONS, EQUIPMENT_TRANSLATIONS } from '@/lib/constants';

export interface ExerciseItem {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  equipment: EquipmentType;
  weightIncrement: number;
  imageUrl?: string | null;
  instructions?: string | null;
}

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableExercises: ExerciseItem[];
  onSelect: (exercise: ExerciseItem) => void;
  mode?: 'add' | 'swap';
  swappingExerciseName?: string;
}

export function AddExerciseModal({
  isOpen,
  onClose,
  availableExercises,
  onSelect,
  mode = 'add',
  swappingExerciseName,
}: AddExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'ALL'>('ALL');

  const filteredExercises = useMemo(() => {
    return availableExercises.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (MUSCLE_TRANSLATIONS[ex.primaryMuscle] || '').toLowerCase().includes(search.toLowerCase());

      const matchMuscle = selectedMuscle === 'ALL' || ex.primaryMuscle === selectedMuscle;
      return matchSearch && matchMuscle;
    });
  }, [availableExercises, search, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              {mode === 'swap' ? <Replace className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-base">
                {mode === 'swap' ? 'Ganti Gerakan (Alat Terpakai)' : 'Tambah Gerakan ke Sesi'}
              </h3>
              {mode === 'swap' && swappingExerciseName && (
                <p className="text-xs text-zinc-400">
                  Menggantikan: <span className="text-amber-400">{swappingExerciseName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-zinc-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari gerakan atau mesin..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Muscle Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedMuscle('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                selectedMuscle === 'ALL'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Semua Otot
            </button>
            {Object.entries(MUSCLE_TRANSLATIONS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMuscle(key as MuscleGroup)}
                className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                  selectedMuscle === key
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-zinc-800/40">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              Gerakan tidak ditemukan. Coba kata kunci lain.
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-zinc-800/70 transition-colors flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {ex.imageUrl ? (
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      loading="lazy"
                      className="w-10 h-12 object-contain rounded-lg bg-zinc-950 border border-white/[0.10] shrink-0"
                    />
                  ) : (
                    <span className="w-10 h-12 rounded-lg bg-zinc-950 border border-white/[0.10] flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4 text-zinc-600" />
                    </span>
                  )}
                  <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {MUSCLE_TRANSLATIONS[ex.primaryMuscle]}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {EQUIPMENT_TRANSLATIONS[ex.equipment]}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      ±{ex.weightIncrement}kg
                    </span>
                  </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-emerald-400 bg-zinc-800 group-hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors">
                  Pilih
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
