'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Play,
  Search,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  getProgramByIdAction,
  getExercisesAction,
  addExerciseToProgramAction,
  updateProgramExerciseAction,
  removeExerciseFromProgramAction,
  reorderProgramExercisesAction,
} from '@/app/actions/latihan-actions';
import { MUSCLE_LABELS, EQUIPMENT_LABELS } from '@/lib/constants';
import { ExerciseFormModal } from './exercise-form-modal';
import { roundWeight, weightUnitLabel } from '@/lib/units';

type ProgramDetailType = Awaited<ReturnType<typeof getProgramByIdAction>>;
type AllExercisesType = Awaited<ReturnType<typeof getExercisesAction>>;

function SortableProgramExerciseItem({
  item,
  index,
  accentColor,
  onUpdate,
  onRemove,
  weightUnit,
}: {
  item: ProgramDetailType['exercises'][number];
  index: number;
  accentColor: string;
  onUpdate: (
    id: string,
    payload: {
      targetSets: number;
      targetRepMin: number;
      targetRepMax: number;
      restSeconds: number;
      notes?: string | null;
    }
  ) => void;
  onRemove: (id: string) => void;
  weightUnit?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [sets, setSets] = useState(item.targetSets);
  const [repMin, setRepMin] = useState(item.targetRepMin);
  const [repMax, setRepMax] = useState(item.targetRepMax);
  const [restSec, setRestSec] = useState(item.restSeconds);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [isDirty, setIsDirty] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3 ${
        isDragging ? 'opacity-75 scale-[1.02] z-30 shadow-2xl' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1.5 rounded-lg text-[var(--muted-strong)] hover:text-[var(--fg-strong)] touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/latihan/gerakan/${item.exercise.id}`}
              className="font-bold text-sm text-[var(--fg-strong)] hover:text-emerald-400 flex items-center gap-1.5"
            >
              <span
                style={{ color: accentColor }}
                className="font-extrabold mr-1"
              >
                #{index + 1}
              </span>
              {item.exercise.name}
              <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-strong)] shrink-0" />
            </Link>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-lg text-[var(--muted-strong)] hover:text-red-400"
              title="Hapus gerakan dari program"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {MUSCLE_LABELS[item.exercise.primaryMuscle]} •{' '}
            {EQUIPMENT_LABELS[item.exercise.equipment]} (+
            {roundWeight(item.exercise.weightIncrement, weightUnit)} {weightUnitLabel(weightUnit)})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1">
            Target Set
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={sets}
            onChange={(e) => {
              setSets(Number(e.target.value));
              setIsDirty(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1">
            Rep Min
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={repMin}
            onChange={(e) => {
              setRepMin(Number(e.target.value));
              setIsDirty(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1">
            Rep Max
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={repMax}
            onChange={(e) => {
              setRepMax(Number(e.target.value));
              setIsDirty(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1 flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> Istirahat(d)
          </label>
          <input
            type="number"
            inputMode="numeric"
            step={15}
            min={10}
            max={600}
            value={restSec}
            onChange={(e) => {
              setRestSec(Number(e.target.value));
              setIsDirty(true);
            }}
            className="w-full px-2.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Catatan setelan kursi / pin (contoh: Kursi no 4)..."
          className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg-strong)]"
        />

        {isDirty && (
          <button
            type="button"
            onClick={() => {
              onUpdate(item.id, {
                targetSets: sets,
                targetRepMin: repMin,
                targetRepMax: repMax,
                restSeconds: restSec,
                notes,
              });
              setIsDirty(false);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1 shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            Simpan
          </button>
        )}
      </div>
    </div>
  );
}

export function ProgramDetailClient({
  initialProgram,
  allExercises,
  userId = '',
  weightUnit,
}: {
  initialProgram: ProgramDetailType;
  allExercises: AllExercisesType;
  userId?: string;
  weightUnit?: string;
}) {
  const queryClient = useQueryClient();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const { data: program = initialProgram } = useQuery({
    queryKey: ['program', initialProgram.id],
    queryFn: () => getProgramByIdAction(initialProgram.id),
    initialData: initialProgram,
  });

  const { data: exercises = allExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => getExercisesAction(false),
    initialData: allExercises,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const addMutation = useMutation({
    mutationFn: (exerciseId: string) =>
      addExerciseToProgramAction({
        programId: program.id,
        exerciseId,
        targetSets: 3,
        targetRepMin: 8,
        targetRepMax: 12,
        restSeconds: 90,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', program.id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        targetSets: number;
        targetRepMin: number;
        targetRepMax: number;
        restSeconds: number;
        notes?: string | null;
      };
    }) => updateProgramExerciseAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', program.id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeExerciseFromProgramAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', program.id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      reorderProgramExercisesAction(program.id, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', program.id] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = program.exercises.findIndex((i) => i.id === active.id);
    const newIndex = program.exercises.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(program.exercises, oldIndex, newIndex);
    queryClient.setQueryData(['program', program.id], {
      ...program,
      exercises: reordered,
    });
    reorderMutation.mutate(reordered.map((i) => i.id));
  };

  const filteredPickerExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/latihan"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--fg-strong)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Master Latihan
        </Link>
      </div>

      <div
        className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
        style={{ borderTopWidth: '4px', borderTopColor: program.color }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--fg-strong)]">{program.name}</h1>
            {program.description && (
              <p className="text-xs text-[var(--muted)] mt-1">
                {program.description}
              </p>
            )}
            <p className="text-xs text-[var(--muted-strong)] mt-2">
              {program.exercises.length} gerakan • Geser ikon titik-titik untuk
              mengatur urutan
            </p>
          </div>

          <Link
            href={`/workout?programId=${program.id}`}
            style={{ backgroundColor: program.color }}
            className="px-4 py-3 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            Mulai Sesi
          </Link>
        </div>
      </div>

      {program.exercises.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <p className="font-semibold text-[var(--fg-strong)]">
            Program Ini Masih Kosong
          </p>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">
            Tambahkan gerakan dari pustaka 40 gerakan mesin atau buat gerakan
            baru.
          </p>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="px-4 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Gerakan Pertama
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={program.exercises.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {program.exercises.map((item, index) => (
                <SortableProgramExerciseItem
                  key={item.id}
                  item={item}
                  index={index}
                  accentColor={program.color}
                  onUpdate={(id, payload) =>
                    updateMutation.mutate({ id, payload })
                  }
                  onRemove={(id) => removeMutation.mutate(id)}
                  weightUnit={weightUnit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="py-3.5 px-3 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--fg-strong)] font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Pilih dari Pustaka
        </button>

        <button
          type="button"
          onClick={() => setIsNewExerciseModalOpen(true)}
          className="py-3.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Buat Gerakan Baru
        </button>
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-[var(--surface)] border-t sm:border border-[var(--border)] w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-bold text-base">
                Tambah Gerakan ke {program.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-xs font-semibold text-[var(--muted)] px-3 py-1.5 rounded-lg bg-[var(--surface-2)]"
              >
                Tutup
              </button>
            </div>

            <div className="p-3 border-b border-[var(--border)] space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--muted-strong)] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Cari gerakan..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setIsNewExerciseModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs"
              >
                + Tidak menemukan alat? Buat Gerakan Baru Langsung
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredPickerExercises.map((ex) => {
                const alreadyInProgram = program.exercises.some(
                  (pe) => pe.exerciseId === ex.id
                );
                return (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[var(--fg-strong)]">
                        {ex.name}
                      </p>
                      <p className="text-[11px] text-[var(--muted)]">
                        {MUSCLE_LABELS[ex.primaryMuscle]} •{' '}
                        {EQUIPMENT_LABELS[ex.equipment]}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={addMutation.isPending}
                      onClick={() => addMutation.mutate(ex.id)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs shrink-0 ${
                        alreadyInProgram
                          ? 'bg-[var(--surface-2)] text-[var(--fg-soft)]'
                          : 'bg-emerald-500 text-zinc-950'
                      }`}
                    >
                      {alreadyInProgram ? '+ Tambah Lagi' : '+ Tambah'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ExerciseFormModal
        isOpen={isNewExerciseModalOpen}
        onClose={() => setIsNewExerciseModalOpen(false)}
        attachToProgramId={program.id}
        userId={userId}
      />
    </div>
  );
}
