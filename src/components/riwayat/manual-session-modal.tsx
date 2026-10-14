'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, Plus, Trash2, Calendar, Dumbbell, Clock, Check } from 'lucide-react';
import { SetType } from '@prisma/client';
import { createManualWorkoutSessionAction } from '@/app/actions/riwayat-actions';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableExercises: any[];
  onSuccess: () => void;
}

interface ManualExerciseState {
  exerciseId: string;
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
    setType: SetType;
  }>;
}

export function ManualSessionModal({
  isOpen,
  onClose,
  availableExercises,
  onSuccess,
}: ManualSessionModalProps) {
  const [name, setName] = useState('Latihan Gym');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationMin, setDurationMin] = useState(50);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ManualExerciseState[]>([]);
  const [selectedExId, setSelectedExId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    if (!selectedExId) return;
    const found = availableExercises.find((e) => e.id === selectedExId);
    if (!found) return;

    setExercises((prev) => [
      ...prev,
      {
        exerciseId: found.id,
        name: found.name,
        sets: [
          { weight: 40, reps: 10, setType: SetType.NORMAL },
          { weight: 40, reps: 10, setType: SetType.NORMAL },
          { weight: 40, reps: 10, setType: SetType.NORMAL },
        ],
      },
    ]);
    setSelectedExId('');
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSet = (exIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const target = { ...next[exIdx] };
      const last = target.sets[target.sets.length - 1];
      target.sets = [
        ...target.sets,
        {
          weight: last ? last.weight : 40,
          reps: last ? last.reps : 10,
          setType: SetType.NORMAL,
        },
      ];
      next[exIdx] = target;
      return next;
    });
  };

  const handleRemoveSet = (exIdx: number, sIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const target = { ...next[exIdx] };
      if (target.sets.length <= 1) return prev;
      target.sets = target.sets.filter((_, i) => i !== sIdx);
      next[exIdx] = target;
      return next;
    });
  };

  const handleUpdateSet = (
    exIdx: number,
    sIdx: number,
    field: 'weight' | 'reps',
    val: number
  ) => {
    setExercises((prev) => {
      const next = [...prev];
      const target = { ...next[exIdx] };
      const newSets = [...target.sets];
      newSets[sIdx] = { ...newSets[sIdx], [field]: val };
      target.sets = newSets;
      next[exIdx] = target;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exercises.length === 0) {
      alert('Pilih minimal 1 gerakan latihan.');
      return;
    }

    try {
      setIsLoading(true);
      await createManualWorkoutSessionAction({
        name,
        date,
        durationMin: Number(durationMin) || 45,
        notes,
        exercises: exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        })),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan sesi manual.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-100 text-base">Catat Sesi Manual</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-zinc-400">Nama Sesi Latihan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Push Day / Latihan Dada"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400">Tanggal Latihan</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400">Durasi (Menit)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tambah Gerakan Section */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Gerakan yang Dilakukan
            </label>

            <div className="flex gap-2">
              <select
                value={selectedExId}
                onChange={(e) => setSelectedExId(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Pilih Gerakan / Mesin --</option>
                {availableExercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddExercise}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          {/* List Gerakan Terpilih */}
          <div className="space-y-3">
            {exercises.map((ex, exIdx) => (
              <div
                key={ex.exerciseId + exIdx}
                className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-zinc-100">{ex.name}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {ex.sets.map((s, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-zinc-500 font-mono">#{sIdx + 1}</span>
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={s.weight}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center font-mono text-zinc-100"
                        />
                        <span className="text-[11px] text-zinc-500">kg</span>
                      </div>
                      <span className="text-zinc-500">×</span>
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={s.reps}
                          onChange={(e) =>
                            handleUpdateSet(exIdx, sIdx, 'reps', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center font-mono text-zinc-100"
                        />
                        <span className="text-[11px] text-zinc-500">rep</span>
                      </div>
                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exIdx, sIdx)}
                          className="text-zinc-600 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Set
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Catatan Sesi (Opsional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kondisi fisik, fokus otot, dll..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 mt-1 resize-none focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || exercises.length === 0}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan ke Riwayat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
