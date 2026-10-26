'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Video,
  Repeat,
  Dumbbell,
} from 'lucide-react';
import { getExerciseByIdAction, deleteExerciseAction } from '@/app/actions/latihan-actions';
import type { ProgressPoint } from '@/app/actions/statistik-actions';
import { MUSCLE_LABELS, EQUIPMENT_LABELS } from '@/lib/constants';
import { roundWeight, weightUnitLabel } from '@/lib/units';
import { ExerciseFormModal } from './exercise-form-modal';
import { ExerciseProgressChart } from './exercise-progress-chart';

type ExerciseDetailType = Awaited<ReturnType<typeof getExerciseByIdAction>>;

export function ExerciseDetailClient({
  initialExercise,
  progress = [],
  userId = '',
  weightUnit,
}: {
  initialExercise: ExerciseDetailType;
  progress?: ProgressPoint[];
  userId?: string;
  weightUnit?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: exercise = initialExercise } = useQuery({
    queryKey: ['exercise', initialExercise.id],
    queryFn: () => getExerciseByIdAction(initialExercise.id),
    initialData: initialExercise,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExerciseAction(exercise.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      router.push('/latihan');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/latihan"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--fg-strong)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pustaka
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--fg-strong)] flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          {exercise.isCustom && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Hapus gerakan "${exercise.name}"?`)) {
                  deleteMutation.mutate();
                }
              }}
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ExerciseProgressChart data={progress} weightUnit={weightUnit} />

      {exercise.imageUrl && (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <img
              key={i}
              src={exercise.imageUrl!.replace(/0\.jpg$/, `${i}.jpg`)}
              alt={`${exercise.name} — posisi ${i === 0 ? 'awal' : 'akhir'}`}
              loading="lazy"
              className="w-full aspect-[3/4] object-contain rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
            />
          ))}
        </div>
      )}

      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
            {MUSCLE_LABELS[exercise.primaryMuscle]}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--fg-soft)]">
            {EQUIPMENT_LABELS[exercise.equipment]}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-amber-300">
            Increment +{roundWeight(exercise.weightIncrement, weightUnit)} {weightUnitLabel(weightUnit)}
          </span>
        </div>

        <h1 className="text-xl font-bold text-[var(--fg-strong)]">{exercise.name}</h1>

        {exercise.secondaryMuscles.length > 0 && (
          <p className="text-xs text-[var(--muted)]">
            <span className="text-[var(--muted-strong)]">Otot Pendukung:</span>{' '}
            {exercise.secondaryMuscles
              .map((m) => MUSCLE_LABELS[m])
              .join(', ')}
          </p>
        )}

        {exercise.videoUrl && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            Tonton Video Panduan Gerakan
          </a>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <h2 className="font-bold text-sm flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Langkah-langkah Eksekusi
        </h2>
        <ol className="space-y-2.5 text-sm text-[var(--fg-soft)]">
          {exercise.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {exercise.tips.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <h2 className="font-bold text-sm flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            Tips Teknik & Kontraksi
          </h2>
          <ul className="space-y-2 text-sm text-[var(--fg-soft)] list-disc list-inside">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {exercise.commonMistakes.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <h2 className="font-bold text-sm flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            Kesalahan Umum yang Harus Dihindari
          </h2>
          <ul className="space-y-2 text-sm text-[var(--fg-soft)] list-disc list-inside">
            {exercise.commonMistakes.map((mistake, i) => (
              <li key={i} className="leading-relaxed">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {exercise.alternatives.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <h2 className="font-bold text-sm flex items-center gap-2 text-cyan-400">
            <Repeat className="w-4 h-4" />
            Gerakan Alternatif (Saat Alat Dipakai)
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercise.alternatives.map((alt, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg-strong)] flex items-center gap-1.5"
              >
                <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}

      <ExerciseFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={exercise}
        userId={userId}
        weightUnit={weightUnit}
        onSuccessCreated={(newId) => {
          if (newId !== exercise.id) {
            router.push(`/latihan/gerakan/${newId}`);
          }
        }}
      />
    </div>
  );
}
