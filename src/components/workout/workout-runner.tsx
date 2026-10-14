'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { SetType, MuscleGroup, EquipmentType } from '@prisma/client';
import {
  Timer,
  Play,
  Check,
  Plus,
  Trash2,
  Replace,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ArrowLeft,
  ChevronDown,
  X,
} from 'lucide-react';
import Link from 'next/link';

import { ExerciseSetRow, type SetRowData } from './exercise-set-row';
import { WorkoutTimerBar } from './workout-timer-bar';
import { AddExerciseModal, type ExerciseItem } from './add-exercise-modal';
import { WorkoutSummaryModal } from './workout-summary-modal';
import {
  saveWorkoutSessionAction,
  getExerciseHistoryAction,
  type ExerciseHistoryInfo,
  type NewPRInfo,
} from '@/app/actions/workout-actions';
import { requestScreenWakeLock, releaseScreenWakeLock } from '@/lib/wake-lock';
import { MUSCLE_TRANSLATIONS, EQUIPMENT_TRANSLATIONS } from '@/lib/constants';

interface WorkoutExerciseState {
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  equipment: EquipmentType;
  weightIncrement: number;
  restSeconds: number;
  targetRepMin?: number;
  targetRepMax?: number;
  notes?: string;
  historyInfo?: ExerciseHistoryInfo | null;
  sets: SetRowData[];
}

interface WorkoutRunnerProps {
  user: {
    id: string;
    name: string | null;
    defaultRestTimer: number;
  };
  initialProgram: any | null;
  userPrograms: any[];
  availableExercises: ExerciseItem[];
  initialHistoryMap: Record<string, ExerciseHistoryInfo>;
}

export function WorkoutRunner({
  user,
  initialProgram,
  userPrograms,
  availableExercises,
  initialHistoryMap,
}: WorkoutRunnerProps) {
  const router = useRouter();

  // 1. Inisialisasi State Sesi Latihan
  const [sessionName, setSessionName] = useState(
    initialProgram ? initialProgram.name : 'Latihan Bebas (Freestyle)'
  );
  const [programId, setProgramId] = useState<string | null>(initialProgram?.id || null);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExerciseState[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');

  // 2. State Rest Timer
  const [activeRestTimer, setActiveRestTimer] = useState<{
    key: number;
    duration: number;
  } | null>(null);

  // 3. State Modal
  const [exerciseModalState, setExerciseModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'swap';
    targetExerciseIndex?: number;
    swappingName?: string;
  }>({
    isOpen: false,
    mode: 'add',
  });

  const [summaryData, setSummaryData] = useState<{
    isOpen: boolean;
    durationSec: number;
    totalVolume: number;
    totalSets: number;
    newPRs: NewPRInfo[];
  }>({
    isOpen: false,
    durationSec: 0,
    totalVolume: 0,
    totalSets: 0,
    newPRs: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ exists: boolean; date?: string }>({
    exists: false,
  });

  const storageKey = `besilog_workout_draft_${user.id}`;

  // Helper membuat initial exercises dari program
  const createExercisesFromProgram = useCallback((prog: any) => {
    return (prog.exercises || []).map((pe: any, idx: number) => {
      const hist = initialHistoryMap[pe.exerciseId];
      const targetSetsCount = pe.targetSets || 3;
      const weightIncrement = pe.exercise.weightIncrement || 2.5;

      const sets: SetRowData[] = [];
      for (let s = 0; s < targetSetsCount; s++) {
        const prevSet = hist?.previousSets?.[s];
        // Prefill dari sesi lalu jika ada, atau progressive overload suggestion
        let prefillWeight = prevSet ? prevSet.weight : 0;
        if (s === 0 && hist?.progressiveOverloadSuggestion) {
          prefillWeight += hist.progressiveOverloadSuggestion.suggestedWeightIncrement;
        }

        sets.push({
          id: `set_${pe.exerciseId}_${s + 1}_${Date.now()}_${Math.random()}`,
          setNumber: s + 1,
          weight: prefillWeight,
          reps: prevSet ? prevSet.reps : pe.targetRepMax || 10,
          setType: prevSet?.setType || SetType.NORMAL,
          isCompleted: false,
          previousRecord: prevSet
            ? {
                weight: prevSet.weight,
                reps: prevSet.reps,
              }
            : null,
        });
      }

      return {
        exerciseId: pe.exerciseId,
        name: pe.exercise.name,
        primaryMuscle: pe.exercise.primaryMuscle,
        equipment: pe.exercise.equipment,
        weightIncrement,
        restSeconds: pe.restSeconds || user.defaultRestTimer || 90,
        targetRepMin: pe.targetRepMin,
        targetRepMax: pe.targetRepMax,
        historyInfo: hist,
        sets,
      };
    });
  }, [initialHistoryMap, user.defaultRestTimer]);

  // Check LocalStorage Draft on Mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.exercises && parsed.exercises.length > 0) {
          setDraftBanner({
            exists: true,
            date: new Date(parsed.startedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
          return;
        }
      }
    } catch {
      // ignore
    }

    // Jika tidak ada draft, inisialisasi dari initialProgram jika ada
    if (initialProgram) {
      setExercises(createExercisesFromProgram(initialProgram));
    }
  }, [initialProgram, createExercisesFromProgram, storageKey]);

  // Load draft function
  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessionName(parsed.sessionName || 'Latihan');
        setProgramId(parsed.programId || null);
        setStartedAt(parsed.startedAt || new Date().toISOString());
        setSessionNotes(parsed.sessionNotes || '');
        setExercises(parsed.exercises || []);

        // Recalculate elapsed seconds
        const diff = Math.floor((Date.now() - new Date(parsed.startedAt).getTime()) / 1000);
        setElapsedSeconds(Math.max(0, diff));
      }
    } catch {
      // ignore
    } finally {
      setDraftBanner({ exists: false });
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(storageKey);
    setDraftBanner({ exists: false });
    if (initialProgram) {
      setExercises(createExercisesFromProgram(initialProgram));
    } else {
      setExercises([]);
    }
    setStartedAt(new Date().toISOString());
    setElapsedSeconds(0);
  };

  // Auto-save draft ke localStorage setiap kali ada perubahan data sesi
  useEffect(() => {
    if (exercises.length === 0) return;
    try {
      const draftPayload = {
        sessionName,
        programId,
        startedAt,
        sessionNotes,
        exercises,
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftPayload));
    } catch {
      // ignore
    }
  }, [sessionName, programId, startedAt, sessionNotes, exercises, storageKey]);

  // Live Workout Timer & Screen Wake Lock
  useEffect(() => {
    requestScreenWakeLock();

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      releaseScreenWakeLock();
    };
  }, []);

  // Format Timer mm:ss atau hh:mm:ss
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handler update set (dengan path replacement ringan agar input tetap instan)
  const handleUpdateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updated: Partial<SetRowData>) => {
      setExercises((prev) => {
        const next = [...prev];
        const targetEx = { ...next[exerciseIndex] };
        const nextSets = [...targetEx.sets];
        nextSets[setIndex] = { ...nextSets[setIndex], ...updated };
        targetEx.sets = nextSets;
        next[exerciseIndex] = targetEx;
        return next;
      });
    },
    []
  );

  // Handler centang set selesai -> Picu Timer Istirahat
  const handleToggleComplete = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const targetEx = { ...next[exerciseIndex] };
        const nextSets = [...targetEx.sets];
        const currentStatus = nextSets[setIndex].isCompleted;
        const newStatus = !currentStatus;

        nextSets[setIndex] = { ...nextSets[setIndex], isCompleted: newStatus };
        targetEx.sets = nextSets;
        next[exerciseIndex] = targetEx;

        // Jika set baru saja diselesaikan, jalankan Rest Timer
        if (newStatus) {
          const restSec = targetEx.restSeconds || user.defaultRestTimer || 90;
          setActiveRestTimer({ key: Date.now(), duration: restSec });
        }

        return next;
      });
    },
    [user.defaultRestTimer]
  );

  // Tambah set baru pada gerakan tertentu
  const handleAddSet = useCallback((exerciseIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exerciseIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];

      const newSet: SetRowData = {
        id: `set_${targetEx.exerciseId}_${targetEx.sets.length + 1}_${Date.now()}`,
        setNumber: targetEx.sets.length + 1,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : targetEx.targetRepMax || 10,
        setType: SetType.NORMAL,
        isCompleted: false,
        previousRecord: null,
      };

      targetEx.sets = [...targetEx.sets, newSet];
      next[exerciseIndex] = targetEx;
      return next;
    });
  }, []);

  // Hapus set dari gerakan
  const handleDeleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exerciseIndex] };
      if (targetEx.sets.length <= 1) return prev;

      const filtered = targetEx.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      targetEx.sets = filtered;
      next[exerciseIndex] = targetEx;
      return next;
    });
  }, []);

  // Hapus gerakan dari sesi
  const handleDeleteExercise = (exerciseIndex: number) => {
    if (confirm('Hapus gerakan ini dari sesi latihan Anda?')) {
      setExercises((prev) => prev.filter((_, idx) => idx !== exerciseIndex));
    }
  };

  // Handle pilih gerakan dari modal (Tambah atau Ganti)
  const handleSelectExerciseFromModal = async (newEx: ExerciseItem) => {
    // Ambil riwayat untuk gerakan baru ini
    let history: ExerciseHistoryInfo | null = null;
    try {
      history = await getExerciseHistoryAction(newEx.id);
    } catch {
      // ignore
    }

    if (exerciseModalState.mode === 'swap' && exerciseModalState.targetExerciseIndex !== undefined) {
      // Mode GANTI GERAKAN (Alat dipakai orang lain)
      const targetIdx = exerciseModalState.targetExerciseIndex;
      setExercises((prev) => {
        const next = [...prev];
        const oldEx = next[targetIdx];

        // Buat set baru mengikuti jumlah set sebelumnya atau set riwayat
        const newSets: SetRowData[] = (oldEx.sets || [1, 2, 3]).map((_, idx) => {
          const prevSet = history?.previousSets?.[idx];
          return {
            id: `swap_set_${newEx.id}_${idx + 1}_${Date.now()}`,
            setNumber: idx + 1,
            weight: prevSet ? prevSet.weight : 0,
            reps: prevSet ? prevSet.reps : 10,
            setType: prevSet?.setType || SetType.NORMAL,
            isCompleted: false,
            previousRecord: prevSet ? { weight: prevSet.weight, reps: prevSet.reps } : null,
          };
        });

        next[targetIdx] = {
          exerciseId: newEx.id,
          name: newEx.name,
          primaryMuscle: newEx.primaryMuscle,
          equipment: newEx.equipment,
          weightIncrement: newEx.weightIncrement || 2.5,
          restSeconds: oldEx.restSeconds || 90,
          notes: `(Pengganti ${oldEx.name})`,
          historyInfo: history,
          sets: newSets,
        };

        return next;
      });
    } else {
      // Mode TAMBAH GERAKAN BARU
      const defaultSetsCount = 3;
      const sets: SetRowData[] = [];
      for (let s = 0; s < defaultSetsCount; s++) {
        const prevSet = history?.previousSets?.[s];
        sets.push({
          id: `new_set_${newEx.id}_${s + 1}_${Date.now()}`,
          setNumber: s + 1,
          weight: prevSet ? prevSet.weight : 0,
          reps: prevSet ? prevSet.reps : 10,
          setType: prevSet?.setType || SetType.NORMAL,
          isCompleted: false,
          previousRecord: prevSet ? { weight: prevSet.weight, reps: prevSet.reps } : null,
        });
      }

      const newExerciseState: WorkoutExerciseState = {
        exerciseId: newEx.id,
        name: newEx.name,
        primaryMuscle: newEx.primaryMuscle,
        equipment: newEx.equipment,
        weightIncrement: newEx.weightIncrement || 2.5,
        restSeconds: user.defaultRestTimer || 90,
        historyInfo: history,
        sets,
      };

      setExercises((prev) => [...prev, newExerciseState]);
    }
  };

  // Selesaikan Sesi Latihan
  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      alert('Tambahkan minimal 1 gerakan latihan sebelum menyelesaikan sesi.');
      return;
    }

    const completedSetsCount = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0
    );

    if (completedSetsCount === 0) {
      if (!confirm('Belum ada set yang dicentang selesai. Tetap ingin menyimpan sesi ini?')) {
        return;
      }
    }

    try {
      setIsSaving(true);

      const payload = {
        programId: programId || null,
        name: sessionName || 'Sesi Latihan',
        startedAt,
        endedAt: new Date().toISOString(),
        durationSec: elapsedSeconds,
        notes: sessionNotes || null,
        exercises: exercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          sortOrder: idx + 1,
          restSeconds: ex.restSeconds || 90,
          notes: ex.notes || null,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            setType: s.setType,
            rpe: s.rpe || null,
            isCompleted: s.isCompleted,
          })),
        })),
      };

      const result = await saveWorkoutSessionAction(payload);

      // Bersihkan draft localStorage
      localStorage.removeItem(storageKey);

      // Buka Celebration Summary Modal
      setSummaryData({
        isOpen: true,
        durationSec: elapsedSeconds,
        totalVolume: result.totalVolume,
        totalSets: completedSetsCount,
        newPRs: result.newPRs || [],
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan sesi latihan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Hitung total beban terangkat live
  const liveVolume = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sAcc, set) => {
        return set.isCompleted ? sAcc + (Number(set.weight) || 0) * (Number(set.reps) || 0) : sAcc;
      }, 0)
    );
  }, 0);

  return (
    <div className="pb-40 max-w-lg mx-auto" style={{ touchAction: 'pan-y' }}>
      {/* Draft Recovery Banner */}
      {draftBanner.exists && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">Draft Sesi Ditemukan</p>
              <p className="text-[11px] text-zinc-400">
                Dimulai pukul {draftBanner.date}. Lanjutkan latihan?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadDraft}
              className="px-2.5 py-1 bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs"
            >
              Lanjut
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Top Header / Sticky Bar */}
      <div className="sticky top-0 z-30 bg-[#08090a]/95 backdrop-blur-xl border-b border-white/[0.08] -mx-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-90 transition-transform shrink-0 touch-manipulation"
            aria-label="Kembali ke beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Session Title Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-transparent font-extrabold text-white text-base focus:outline-none truncate"
              placeholder="Nama Sesi Latihan..."
            />
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold tabular-nums">
                <Timer className="w-3.5 h-3.5" />
                {formatTimer(elapsedSeconds)}
              </span>
              <span>•</span>
              <span className="font-mono text-zinc-300 tabular-nums">{liveVolume.toLocaleString('id-ID')} kg</span>
            </div>
          </div>

          {/* Tombol Selesai */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleFinishWorkout}
            className="px-4 h-10 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50 transition-transform shrink-0 touch-manipulation"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Menyimpan...' : 'Selesai'}</span>
          </button>
        </div>
      </div>

      {/* Daftar Gerakan Latihan */}
      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Belum Ada Gerakan</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
                Mulai latihan dengan menambahkan gerakan atau pilih dari program yang tersedia.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setExerciseModalState({
                  isOpen: true,
                  mode: 'add',
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Tambah Gerakan Pertama
            </button>
          </div>
        ) : (
          exercises.map((ex, exIndex) => (
            <div
              key={`${ex.exerciseId}_${exIndex}`}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 shadow-sm space-y-3"
            >
              {/* Exercise Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {MUSCLE_TRANSLATIONS[ex.primaryMuscle]}
                    </span>
                    <span>•</span>
                    <span>{EQUIPMENT_TRANSLATIONS[ex.equipment]}</span>
                    <span>•</span>
                    <span className="font-mono">±{ex.weightIncrement}kg</span>
                  </div>
                </div>

                {/* Actions: Ganti Gerakan (Alat Terpakai) & Hapus */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExerciseModalState({
                        isOpen: true,
                        mode: 'swap',
                        targetExerciseIndex: exIndex,
                        swappingName: ex.name,
                      })
                    }
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-amber-300 transition-colors"
                    title="Ganti gerakan (alat penuh/terpakai)"
                  >
                    <Replace className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(exIndex)}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Hapus gerakan dari sesi ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progressive Overload Suggestion Badge */}
              {ex.historyInfo?.progressiveOverloadSuggestion && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-xl p-2.5 flex items-start gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Saran Progressive Overload!</p>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                      {ex.historyInfo.progressiveOverloadSuggestion.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Sets Table Header */}
              <div className="flex items-center gap-1 px-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                <span className="w-8 text-center shrink-0">Set</span>
                <span className="w-12 text-center shrink-0 hidden sm:block">Lalu</span>
                <span className="flex-1 text-center">Beban</span>
                <span className="flex-1 text-center">Reps</span>
                <span className="w-9 text-center shrink-0">✓</span>
                <span className="w-7 shrink-0" />
              </div>

              {/* Set Rows */}
              <div className="space-y-1.5">
                {ex.sets.map((set, sIndex) => (
                  <ExerciseSetRow
                    key={set.id}
                    set={set}
                    index={sIndex}
                    weightIncrement={ex.weightIncrement}
                    onChange={(updated) => handleUpdateSet(exIndex, sIndex, updated)}
                    onToggleComplete={() => handleToggleComplete(exIndex, sIndex)}
                    onDelete={() => handleDeleteSet(exIndex, sIndex)}
                    canDelete={ex.sets.length > 1}
                  />
                ))}
              </div>

              {/* Add Set Button */}
              <button
                type="button"
                onClick={() => handleAddSet(exIndex)}
                className="w-full py-2 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-dashed border-white/[0.08]"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Set
              </button>
            </div>
          ))
        )}

        {/* Tombol Tambah Gerakan Lain */}
        {exercises.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setExerciseModalState({
                isOpen: true,
                mode: 'add',
              })
            }
            className="w-full py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            Tambah Gerakan Lain
          </button>
        )}
      </div>

      {/* Floating Rest Timer Bar */}
      {activeRestTimer && (
        <WorkoutTimerBar
          key={activeRestTimer.key}
          initialSeconds={activeRestTimer.duration}
          onClose={() => setActiveRestTimer(null)}
          onFinish={() => setActiveRestTimer(null)}
        />
      )}

      {/* Add / Swap Exercise Modal */}
      <AddExerciseModal
        isOpen={exerciseModalState.isOpen}
        onClose={() => setExerciseModalState((prev) => ({ ...prev, isOpen: false }))}
        availableExercises={availableExercises}
        mode={exerciseModalState.mode}
        swappingExerciseName={exerciseModalState.swappingName}
        onSelect={handleSelectExerciseFromModal}
      />

      {/* Celebration Summary Modal */}
      <WorkoutSummaryModal
        isOpen={summaryData.isOpen}
        durationSec={summaryData.durationSec}
        totalVolume={summaryData.totalVolume}
        totalSets={summaryData.totalSets}
        newPRs={summaryData.newPRs}
        onClose={() => {
          setSummaryData((prev) => ({ ...prev, isOpen: false }));
          router.push('/riwayat');
        }}
      />
    </div>
  );
}
