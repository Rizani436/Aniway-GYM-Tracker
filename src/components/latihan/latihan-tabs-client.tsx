'use client';

import { useState, useMemo } from 'react';
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
  Plus,
  GripVertical,
  Search,
  Archive,
  Trash2,
  Edit3,
  ChevronRight,
  Dumbbell,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { MuscleGroup } from '@prisma/client';
import {
  getProgramsAction,
  getExercisesAction,
  upsertProgramAction,
  toggleArchiveProgramAction,
  deleteProgramAction,
  reorderProgramsAction,
} from '@/app/actions/latihan-actions';
import {
  MUSCLE_LABELS,
  EQUIPMENT_LABELS,
  PROGRAM_COLORS,
} from '@/lib/constants';
import { ExerciseFormModal } from './exercise-form-modal';
import { roundWeight, weightUnitLabel } from '@/lib/units';

type ProgramListType = Awaited<ReturnType<typeof getProgramsAction>>;
type ExerciseListType = Awaited<ReturnType<typeof getExercisesAction>>;

interface SortableProgramCardProps {
  program: ProgramListType[number];
  onEdit: (program: ProgramListType[number]) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function SortableProgramCard({
  program,
  onEdit,
  onArchive,
  onDelete,
}: SortableProgramCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: program.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition ${
        isDragging ? 'opacity-70 scale-[1.02] z-30 shadow-2xl' : ''
      }`}
    >
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: program.color }}
      />
      <div className="p-4 flex items-start gap-3">
        {!program.isArchived && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 p-1.5 rounded-lg text-[var(--muted-strong)] hover:text-[var(--fg-soft)] touch-none active:bg-[var(--surface-2)]"
            aria-label="Geser urutan program"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <Link
            href={`/latihan/program/${program.id}`}
            className="flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--fg-strong)] group-hover:text-emerald-400 transition">
                  {program.name}
                </h3>
                {program.isArchived && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                    Arsip
                  </span>
                )}
              </div>
              {program.description && (
                <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
                  {program.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-strong)] shrink-0" />
          </Link>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {program.exercises.length === 0 ? (
              <span className="text-xs text-[var(--muted-strong)] italic">
                Belum ada gerakan
              </span>
            ) : (
              program.exercises.slice(0, 4).map((pe) => (
                <span
                  key={pe.id}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--fg-soft)]"
                >
                  {pe.exercise.name} ({pe.targetSets}×{pe.targetRepMin}-
                  {pe.targetRepMax})
                </span>
              ))
            )}
            {program.exercises.length > 4 && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                +{program.exercises.length - 4} lagi
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(program)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--fg-strong)] hover:bg-[var(--surface-2)]"
                title="Edit Program"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onArchive(program.id)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-amber-400 hover:bg-[var(--surface-2)]"
                title={program.isArchived ? 'Pulihkan Program' : 'Arsipkan'}
              >
                {program.isArchived ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onDelete(program.id, program.name)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-red-400 hover:bg-[var(--surface-2)]"
                title="Hapus Program"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Link
              href={`/workout?programId=${program.id}`}
              style={{ backgroundColor: program.color }}
              className="px-3.5 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mulai Latihan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LatihanTabsClient({
  initialPrograms,
  initialExercises,
  userId,
  weightUnit,
}: {
  initialPrograms: ProgramListType;
  initialExercises: ExerciseListType;
  userId: string;
  weightUnit?: string;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'programs' | 'exercises'>(
    'programs'
  );
  const [showArchivedPrograms, setShowArchivedPrograms] = useState(false);

  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<
    ProgramListType[number] | null
  >(null);
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progColor, setProgColor] = useState(PROGRAM_COLORS[0].value);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [selectedProgramFilter, setSelectedProgramFilter] =
    useState<string>('ALL');
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const { data: programs = initialPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getProgramsAction(true),
    initialData: initialPrograms,
  });

  const { data: exercises = initialExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => getExercisesAction(false),
    initialData: initialExercises,
  });

  const activePrograms = useMemo(
    () => programs.filter((p) => !p.isArchived),
    [programs]
  );
  const archivedPrograms = useMemo(
    () => programs.filter((p) => p.isArchived),
    [programs]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderProgramsAction(orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });

  const saveProgramMutation = useMutation({
    mutationFn: () =>
      upsertProgramAction({
        id: editingProgram?.id,
        name: progName,
        description: progDesc,
        color: progColor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsProgramModalOpen(false);
    },
  });

  const archiveProgramMutation = useMutation({
    mutationFn: (id: string) => toggleArchiveProgramAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });

  const deleteProgramMutation = useMutation({
    mutationFn: (id: string) => deleteProgramAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activePrograms.findIndex((p) => p.id === active.id);
    const newIndex = activePrograms.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activePrograms, oldIndex, newIndex);
    queryClient.setQueryData(
      ['programs'],
      [...reordered, ...archivedPrograms]
    );
    reorderMutation.mutate(reordered.map((p) => p.id));
  };

  const openCreateProgramModal = () => {
    setEditingProgram(null);
    setProgName('');
    setProgDesc('');
    setProgColor(
      PROGRAM_COLORS[activePrograms.length % PROGRAM_COLORS.length].value
    );
    setIsProgramModalOpen(true);
  };

  const openEditProgramModal = (program: ProgramListType[number]) => {
    setEditingProgram(program);
    setProgName(program.name);
    setProgDesc(program.description ?? '');
    setProgColor(program.color);
    setIsProgramModalOpen(true);
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchMuscle =
        selectedMuscle === 'ALL' ||
        ex.primaryMuscle === selectedMuscle ||
        ex.secondaryMuscles.includes(selectedMuscle as MuscleGroup);
      const matchEquipment =
        selectedEquipment === 'ALL' || ex.equipment === selectedEquipment;
      const matchProgram =
        selectedProgramFilter === 'ALL' ||
        ex.programExercises.some(
          (pe) => pe.program.id === selectedProgramFilter
        );

      return matchSearch && matchMuscle && matchEquipment && matchProgram;
    });
  }, [
    exercises,
    searchQuery,
    selectedMuscle,
    selectedEquipment,
    selectedProgramFilter,
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Latihan</h1>
          <p className="text-xs text-[var(--muted)]">
            Kelola program bebas jadwal & 40+ pustaka gerakan mesin
          </p>
        </div>
      </div>

      {/* Switcher Tab */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'programs'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm font-extrabold'
              : 'text-[var(--muted)] hover:text-[var(--fg)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Program ({activePrograms.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exercises')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'exercises'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm font-extrabold'
              : 'text-[var(--muted)] hover:text-[var(--fg)]'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Gerakan ({exercises.length})
        </button>
      </div>

      {/* TAB 1: DAFTAR PROGRAM */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={openCreateProgramModal}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-5 h-5" />
            Buat Program Baru (Push, Pull, Leg, dll)
          </button>

          {activePrograms.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <Layers className="w-10 h-10 text-[var(--muted-strong)] mx-auto mb-3" />
              <p className="font-semibold text-[var(--fg-strong)]">
                Belum Ada Program Latihan
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Buat program seperti Push A, Pull B, atau Upper Body agar Anda
                bisa langsung memulai latihan kapan saja.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activePrograms.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {activePrograms.map((program) => (
                    <SortableProgramCard
                      key={program.id}
                      program={program}
                      onEdit={openEditProgramModal}
                      onArchive={(id) => archiveProgramMutation.mutate(id)}
                      onDelete={(id, name) => {
                        if (
                          window.confirm(
                            `Hapus program "${name}"? Jika sudah memiliki riwayat latihan, program akan diarsipkan.`
                          )
                        ) {
                          deleteProgramMutation.mutate(id);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {archivedPrograms.length > 0 && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowArchivedPrograms((prev) => !prev)}
                className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg-strong)] flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                {showArchivedPrograms ? 'Sembunyikan' : 'Tampilkan'} Program
                Diarsipkan ({archivedPrograms.length})
              </button>

              {showArchivedPrograms && (
                <div className="space-y-3 mt-3 opacity-75">
                  {archivedPrograms.map((program) => (
                    <SortableProgramCard
                      key={program.id}
                      program={program}
                      onEdit={openEditProgramModal}
                      onArchive={(id) => archiveProgramMutation.mutate(id)}
                      onDelete={(id, name) => {
                        if (window.confirm(`Hapus permanen "${name}"?`)) {
                          deleteProgramMutation.mutate(id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUSTAKA GERAKAN */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--muted-strong)] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari gerakan mesin, kabel..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--fg)] focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsExerciseModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Baru
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="px-2 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[11px] text-[var(--fg-strong)] focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="ALL">Semua Otot</option>
              {Object.entries(MUSCLE_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-[var(--surface)] text-[var(--fg)]">
                  {label}
                </option>
              ))}
            </select>

            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-2 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[11px] text-[var(--fg-strong)] focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="ALL">Semua Alat</option>
              {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-[var(--surface)] text-[var(--fg)]">
                  {label}
                </option>
              ))}
            </select>

            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="px-2 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[11px] text-[var(--fg-strong)] focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="ALL">Semua Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--surface)] text-[var(--fg)]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <p className="text-xs text-[var(--muted)]">
                  Tidak ada gerakan yang cocok dengan filter.
                </p>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/latihan/gerakan/${ex.id}`}
                  className="block p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border)] active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      {ex.imageUrl && (
                        <img
                          src={ex.imageUrl}
                          alt={ex.name}
                          loading="lazy"
                          className="w-12 h-16 object-contain rounded-xl bg-[var(--surface)] border border-[var(--border)] shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[var(--fg-strong)]">
                          {ex.name}
                        </h3>
                        {ex.isCustom && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                            Kustom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {MUSCLE_LABELS[ex.primaryMuscle]} •{' '}
                        {EQUIPMENT_LABELS[ex.equipment]} • Increment +
                        {roundWeight(ex.weightIncrement, weightUnit)} {weightUnitLabel(weightUnit)}
                      </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--muted-strong)] shrink-0 mt-0.5" />
                  </div>

                  {ex.programExercises.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {ex.programExercises.map((pe) => (
                        <span
                          key={pe.id}
                          style={{
                            borderColor: `${pe.program.color}50`,
                            color: pe.program.color,
                          }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-[var(--bg)]"
                        >
                          {pe.program.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL BUAT / EDIT PROGRAM */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[var(--surface)] border-t sm:border border-[var(--border)] w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold">
              {editingProgram ? 'Edit Program' : 'Buat Program Baru'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Nama Program *
              </label>
              <input
                type="text"
                required
                value={progName}
                onChange={(e) => setProgName(e.target.value)}
                placeholder="Contoh: Push A (Dada, Bahu, Trisep)"
                className="w-full px-3.5 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--fg-strong)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <input
                type="text"
                value={progDesc}
                onChange={(e) => setProgDesc(e.target.value)}
                placeholder="Fokus mesin hipertrofi dada atas & bahu samping"
                className="w-full px-3.5 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--fg-strong)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-2">
                Warna Aksen Program
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {PROGRAM_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setProgColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-9 h-9 rounded-xl transition ${
                      progColor === c.value
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--surface-2)] text-[var(--fg-soft)] font-semibold text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!progName.trim() || saveProgramMutation.isPending}
                onClick={() => saveProgramMutation.mutate()}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-sm disabled:opacity-50"
              >
                {saveProgramMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT GERAKAN BARU */}
      <ExerciseFormModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        userId={userId}
        weightUnit={weightUnit}
      />
    </div>
  );
}
