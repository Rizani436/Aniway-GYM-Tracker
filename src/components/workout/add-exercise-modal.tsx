'use client';

import { useState, useMemo } from 'react';
import { MuscleGroup, EquipmentType } from '@prisma/client';
import { Search, X, Dumbbell, Replace } from 'lucide-react';
import { MUSCLE_TRANSLATIONS, EQUIPMENT_TRANSLATIONS } from '@/lib/constants';
import { roundWeight, weightUnitLabel } from '@/lib/units';

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
  /** Satuan tampilan user ('KG' | 'LB'); nilai increment di DB tetap KG. */
  weightUnit?: string;
}

export function AddExerciseModal({
  isOpen,
  onClose,
  availableExercises,
  onSelect,
  mode = 'add',
  swappingExerciseName,
  weightUnit,
}: AddExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'ALL'>('ALL');
  const [preview, setPreview] = useState<ExerciseItem | null>(null);

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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              {mode === 'swap' ? <Replace className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-[var(--fg-strong)] text-base">
                {mode === 'swap' ? 'Ganti Gerakan (Alat Terpakai)' : 'Tambah Gerakan ke Sesi'}
              </h3>
              {mode === 'swap' && swappingExerciseName && (
                <p className="text-xs text-[var(--muted)]">
                  Menggantikan: <span className="text-amber-400">{swappingExerciseName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--muted)] hover:text-[var(--fg)] rounded-lg hover:bg-[var(--surface-2)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-[var(--border)] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--muted-strong)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari gerakan atau mesin..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-sm text-[var(--fg-strong)] placeholder-[var(--muted-strong)] focus:outline-none focus:border-emerald-500"
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
                  : 'bg-[var(--surface-2)] text-[var(--fg-soft)] hover:bg-[var(--surface-3)]'
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
                    : 'bg-[var(--surface-2)] text-[var(--fg-soft)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-[var(--border)]">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-[var(--muted-strong)] text-sm">
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
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {ex.imageUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // jangan trigger select gerakan
                        setPreview(ex);
                      }}
                      aria-label={`Perbesar gambar ${ex.name}`}
                      className="shrink-0 active:scale-90 transition-transform"
                    >
                      <img
                        src={ex.imageUrl}
                        alt={ex.name}
                        loading="lazy"
                        className="w-10 h-12 object-contain rounded-lg bg-[var(--bg)] border border-[var(--border)]"
                      />
                    </button>
                  ) : (
                    <span className="w-10 h-12 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4 text-[var(--muted-strong)]" />
                    </span>
                  )}
                  <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-[var(--fg-strong)] group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {MUSCLE_TRANSLATIONS[ex.primaryMuscle]}
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">
                      {EQUIPMENT_TRANSLATIONS[ex.equipment]}
                    </span>
                    <span className="text-[11px] text-[var(--muted-strong)] font-mono">
                      ±{roundWeight(ex.weightIncrement, weightUnit)}{weightUnitLabel(weightUnit)}
                    </span>
                  </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[var(--muted)] group-hover:text-emerald-400 bg-[var(--surface-2)] group-hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors">
                  Pilih
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Lightbox: foto posisi Awal & Akhir */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))] animate-in fade-in duration-150"
          onClick={() => setPreview(null)}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-[var(--fg-strong)] truncate pr-3">
              {preview.name}
            </h4>
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setPreview(null)}
              className="p-2 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-soft)] active:scale-90 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="flex-1 grid grid-cols-2 gap-2 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {[0, 1].map((i) => (
              <div key={i} className="relative min-h-0">
                <img
                  src={preview.imageUrl!.replace(/0\.jpg$/, `${i}.jpg`)}
                  alt={`${preview.name} — posisi ${i === 0 ? 'awal' : 'akhir'}`}
                  className="w-full h-full object-contain rounded-2xl bg-[var(--bg-soft)] border border-[var(--border)]"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-[var(--fg-soft)]">
                  {i === 0 ? 'Awal' : 'Akhir'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onSelect(preview);
              onClose();
            }}
            className="mt-3 w-full py-3.5 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipulation"
          >
            Pilih Gerakan Ini
          </button>
          <p className="text-[10px] text-[var(--muted-strong)] text-center mt-2">
            Tap di luar gambar untuk menutup
          </p>
        </div>
      )}
    </div>
  );
}
