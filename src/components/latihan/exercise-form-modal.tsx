'use client';

import { useState } from 'react';
import { MuscleGroup, EquipmentType } from '@prisma/client';
import { X, Loader2 } from 'lucide-react';
import {
  MUSCLE_LABELS,
  EQUIPMENT_LABELS,
  WEIGHT_INCREMENT_OPTIONS,
} from '@/lib/constants';
import { upsertExerciseAction } from '@/app/actions/latihan-actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ExerciseFormInitialData {
  id?: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  weightIncrement: number;
  steps: string[];
  tips: string[];
  commonMistakes: string[];
  videoUrl?: string | null;
  alternatives: string[];
}

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExerciseFormInitialData | null;
  attachToProgramId?: string;
  onSuccessCreated?: (exerciseId: string) => void;
}

export function ExerciseFormModal({
  isOpen,
  onClose,
  initialData,
  attachToProgramId,
  onSuccessCreated,
}: ExerciseFormModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(initialData?.name ?? '');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>(
    initialData?.primaryMuscle ?? MuscleGroup.CHEST
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>(
    initialData?.secondaryMuscles ?? []
  );
  const [equipment, setEquipment] = useState<EquipmentType>(
    initialData?.equipment ?? EquipmentType.MACHINE
  );
  const [weightIncrement, setWeightIncrement] = useState<number>(
    initialData?.weightIncrement ?? 5
  );
  const [stepsText, setStepsText] = useState(
    initialData?.steps?.join('\n') ??
      'Atur posisi kursi dan beban mesin.\nDorong atau tarik beban dengan terkontrol.\nKembalikan beban secara perlahan.'
  );
  const [tipsText, setTipsText] = useState(
    initialData?.tips?.join('\n') ?? ''
  );
  const [mistakesText, setMistakesText] = useState(
    initialData?.commonMistakes?.join('\n') ?? ''
  );
  const [alternativesText, setAlternativesText] = useState(
    initialData?.alternatives?.join('\n') ?? ''
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const parseLines = (str: string) =>
        str
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

      return upsertExerciseAction(
        {
          id: initialData?.id,
          name,
          primaryMuscle,
          secondaryMuscles,
          equipment,
          weightIncrement,
          steps: parseLines(stepsText),
          tips: parseLines(tipsText),
          commonMistakes: parseLines(mistakesText),
          alternatives: parseLines(alternativesText),
          videoUrl: videoUrl.trim(),
        },
        attachToProgramId
      );
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      if (attachToProgramId) {
        queryClient.invalidateQueries({
          queryKey: ['program', attachToProgramId],
        });
      }
      if (initialData?.id) {
        queryClient.invalidateQueries({
          queryKey: ['exercise', initialData.id],
        });
      }
      onSuccessCreated?.(saved.id);
      onClose();
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    },
  });

  if (!isOpen) return null;

  const toggleSecondaryMuscle = (m: MuscleGroup) => {
    if (m === primaryMuscle) return;
    setSecondaryMuscles((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">
            {initialData?.id ? 'Edit Gerakan' : 'Buat Gerakan Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            mutation.mutate();
          }}
          className="p-5 overflow-y-auto space-y-4 text-sm"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Nama Gerakan *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Seated Row Machine (Close Grip)"
              className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Otot Utama *
              </label>
              <select
                value={primaryMuscle}
                onChange={(e) => {
                  const val = e.target.value as MuscleGroup;
                  setPrimaryMuscle(val);
                  setSecondaryMuscles((prev) => prev.filter((m) => m !== val));
                }}
                className="w-full px-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(MUSCLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Jenis Alat *
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                className="w-full px-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Kenaikan Beban Alat / Increment (kg) *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {WEIGHT_INCREMENT_OPTIONS.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setWeightIncrement(inc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    weightIncrement === inc
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                  }`}
                >
                  +{inc} kg
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.25"
              inputMode="decimal"
              value={weightIncrement}
              onChange={(e) => setWeightIncrement(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Otot Pendukung (Opsional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(MUSCLE_LABELS).map(([key, label]) => {
                const m = key as MuscleGroup;
                if (m === primaryMuscle) return null;
                const active = secondaryMuscles.includes(m);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSecondaryMuscle(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Langkah-langkah Gerakan (1 baris = 1 langkah) *
            </label>
            <textarea
              rows={3}
              required
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Tips Teknik (1 baris = 1 tips)
            </label>
            <textarea
              rows={2}
              value={tipsText}
              onChange={(e) => setTipsText(e.target.value)}
              placeholder="Contoh: Jaga punggung tetap menempel pada sandaran"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Kesalahan Umum (1 baris = 1 poin)
            </label>
            <textarea
              rows={2}
              value={mistakesText}
              onChange={(e) => setMistakesText(e.target.value)}
              placeholder="Contoh: Mengayunkan badan berlebihan"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Gerakan Alternatif (1 baris = 1 nama alat/gerakan)
            </label>
            <textarea
              rows={2}
              value={alternativesText}
              onChange={(e) => setAlternativesText(e.target.value)}
              placeholder="Contoh: Seated Cable Row"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              URL Video Panduan (YouTube / Lainnya)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan Gerakan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
