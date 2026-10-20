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
  StickyNote,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { ExerciseSetRow, type SetRowData } from './exercise-set-row';
import { PlateCalculatorSheet } from './plate-calculator-sheet';
import { WorkoutTimerBar } from './workout-timer-bar';
import { AddExerciseModal, type ExerciseItem } from './add-exercise-modal';
import { WorkoutSummaryModal, type ExerciseTargetStat } from './workout-summary-modal';
import {
  saveWorkoutSessionAction,
  getExerciseHistoryAction,
  type ExerciseHistoryInfo,
  type NewPRInfo,
} from '@/app/actions/workout-actions';
import { requestScreenWakeLock, releaseScreenWakeLock } from '@/lib/wake-lock';
import { MUSCLE_TRANSLATIONS, EQUIPMENT_TRANSLATIONS } from '@/lib/constants';
import { saveWorkoutSnapshot, loadWorkoutSnapshot, findSnapshotUserId, type WorkoutSnapshot } from '@/lib/workout-cache';
import { enqueueSession, pendingCount, flushQueue } from '@/lib/offline-queue';
import { newClientSessionId } from '@/lib/client-id';

interface WorkoutExerciseState {
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  equipment: EquipmentType;
  weightIncrement: number;
  imageUrl?: string | null;
  restSeconds: number;
  targetRepMin?: number;
  targetRepMax?: number;
  targetSets?: number;
  notes?: string;
  historyInfo?: ExerciseHistoryInfo | null;
  sets: SetRowData[];
}

interface WorkoutRunnerProps {
  user: {
    id: string;
    name: string | null;
    /** Ikut dikirim server (page mengirim utuh); opsional agar runner tetap aman saat offline */
    email?: string;
    weightUnit?: string;
    defaultRestTimer: number;
  } | null;
  initialProgram: any | null;
  userPrograms: any[];
  availableExercises: ExerciseItem[];
  initialHistoryMap: Record<string, ExerciseHistoryInfo>;
  /** false = server tidak terjangkau; runner memakai snapshot perangkat */
  serverReachable?: boolean;
  /** true = server TERJANGKAU tapi gagal memuat data (DB timeout dll) */
  initFailed?: boolean;
  /** programId dari URL — dipakai untuk pesan pemulihan yang tepat */
  requestedProgramId?: string | null;
}

export function WorkoutRunner({
  user,
  initialProgram,
  userPrograms,
  availableExercises,
  initialHistoryMap,
  serverReachable = true,
  initFailed = false,
  requestedProgramId = null,
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
  // Cermin state exercises: dipakai handler untuk membaca status TERBARU tanpa
  // harus bergantung pada state di dependency useCallback (kalau depend,
  // identitas callback berubah tiap ketikan -> ExerciseSetRow yang di-memo
  // ikut re-render). Ref selalu berisi nilai render terakhir.
  const exercisesRef = useRef<WorkoutExerciseState[]>(exercises);
  exercisesRef.current = exercises;
  const [sessionNotes, setSessionNotes] = useState('');
  const [isProgramPickerOpen, setIsProgramPickerOpen] = useState(false);

  // Lipatan kartu gerakan. null = mode otomatis (mengikuti gerakan yang sedang
  // dikerjakan). Angka >= 0 = pilihan manual user. -1 = semua dilipat manual,
  // supaya tidak langsung dibuka ulang oleh mode otomatis.
  const [openCardIdx, setOpenCardIdx] = useState<number | null>(null);

  // Kartu yang otomatis terbuka = gerakan pertama yang setnya belum tuntas semua.
  // Begitu set terakhir dicentang, kartu berikutnya terbuka sendiri.
  const autoOpenCardIdx = exercises.findIndex((ex) =>
    ex.sets.some((s) => !s.isCompleted)
  );
  const expandedCardIdx =
    openCardIdx === null
      ? autoOpenCardIdx >= 0
        ? autoOpenCardIdx
        : null
      : openCardIdx;
  const toggleCard = (idx: number) =>
    setOpenCardIdx(expandedCardIdx === idx ? -1 : idx);

  // Pilih program: ganti seluruh gerakan sesuai isi program terpilih.
  // Kenapa bukan cuma set programId: workout harus ikut terisi gerakan program
  // (set, target reps, rest, prefill riwayat) — bukan cuma label.
  const handleSelectProgram = (prog: any) => {
    if (!prog) return;
    const adaPerubahan =
      exercises.some((ex: WorkoutExerciseState) => ex.sets?.some((s: SetRowData) => s.isCompleted)) ||
      exercises.length > 0;
    if (
      adaPerubahan &&
      !confirm(
        `Ganti sesi latihan ke program "${prog.name}"?\nSemua gerakan saat ini akan diganti.`
      )
    ) {
      return;
    }
    setProgramId(prog.id);
    setSessionName(prog.name);
    setExercises(createExercisesFromProgram(prog));
    setStartedAt(new Date().toISOString());
    setElapsedSeconds(0);
    setOpenCardIdx(null); // kembali ke mode otomatis: buka gerakan pertama
    setIsProgramPickerOpen(false);
  };

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
    /** true = sesi tidak terkirim ke server, tersimpan di antrean perangkat */
    queuedOffline?: boolean;
  }>({
    isOpen: false,
    durationSec: 0,
    totalVolume: 0,
    totalSets: 0,
    newPRs: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  // Jumlah sesi di antrean perangkat yang belum terkirim ke server
  const [pending, setPending] = useState(0);
  const [pendingFinish, setPendingFinish] = useState<ExerciseTargetStat[] | null>(null);
  const [expandedImageIdx, setExpandedImageIdx] = useState<number | null>(null);
  // Indeks gerakan yang panel catatannya sedang dibuka
  const [openNoteIdx, setOpenNoteIdx] = useState<number | null>(null);
  const [draftBanner, setDraftBanner] = useState<{ exists: boolean; date?: string }>({
    exists: false,
  });

  // Mode offline: server tidak terjangkau -> pakai snapshot perangkat.
  const offlineUserId = user?.id ?? findSnapshotUserId();
  const [snapshot] = useState<WorkoutSnapshot | null>(() =>
    serverReachable ? null : offlineUserId ? loadWorkoutSnapshot(offlineUserId) : null
  );
  const isOffline = !serverReachable;

  // Turunan aman: `user` boleh null saat offline (data dari snapshot perangkat).
  const currentUser = user ?? snapshot?.user ?? null;
  const restDefault = currentUser?.defaultRestTimer ?? 90;
  const storageKey = `besilog_workout_draft_${currentUser?.id ?? 'offline'}`;

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
          avgRecord: hist?.avgSets?.[s] ?? null,
        });
      }

      return {
        exerciseId: pe.exerciseId,
        name: pe.exercise.name,
        primaryMuscle: pe.exercise.primaryMuscle,
        equipment: pe.exercise.equipment,
        weightIncrement,
        imageUrl: pe.exercise.imageUrl ?? null,
        restSeconds: pe.restSeconds || restDefault || 90,
        targetRepMin: pe.targetRepMin,
        targetRepMax: pe.targetRepMax,
        targetSets: pe.targetSets,
        notes: pe.notes ?? undefined,
        historyInfo: hist,
        sets,
      };
    });
  }, [initialHistoryMap, restDefault]);

  // Check LocalStorage Draft on Mount
  useEffect(() => {
    // Server tak terjangkau ATAU gagal memuat -> coba pulihkan dari snapshot perangkat.
    if (isOffline) {
      const snapProg = (snapshot?.selectedProgram as { id?: string | null; name?: string } | null) ?? null;
      // Penjaga penting: kalau user MEMINTA program tertentu (programId di URL) tapi
      // snapshot berisi program LAIN, jangan pakai — itu akan menampilkan daftar
      // gerakan yang salah tanpa peringatan. Lebih baik tampilkan pesan gagal-muat.
      const cocok = !requestedProgramId || (!!snapProg?.id && snapProg.id === requestedProgramId);
      if (snapshot?.selectedProgram && cocok) {
        if (snapProg?.name) setSessionName(snapProg.name);
        setProgramId(snapProg?.id ?? null);
        setExercises(createExercisesFromProgram(snapshot.selectedProgram));
      }
      return;
    }

    // Jika user membuka /workout dengan programId eksplisit di URL, program
    // MENANG atas draft: maksudnya jelas "mulai sesi dari program ini",
    // bukan melanjutkan draft lama (yang mungkin kosong/salah isi).
    if (initialProgram?.id) {
      try {
        const stale = localStorage.getItem(storageKey);
        if (stale) {
          const p = JSON.parse(stale);
          if (p?.programId !== initialProgram.id) localStorage.removeItem(storageKey);
        }
      } catch {
        // ignore
      }
      setDraftBanner({ exists: false });
      setSessionName(initialProgram.name);
      setExercises(createExercisesFromProgram(initialProgram));
      return;
    }

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
  }, [initialProgram, createExercisesFromProgram, storageKey, isOffline, snapshot]);

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
        setOpenCardIdx(null); // kembali ke mode otomatis: ikuti gerakan aktif

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
    // Simpan snapshot agar /workout bisa dibuka offline lain kali
    if (user) {
      saveWorkoutSnapshot(user.id, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email ?? '',
          weightUnit: user.weightUnit ?? 'kg',
          defaultRestTimer: user.defaultRestTimer,
        },
        selectedProgram: initialProgram,
        userPrograms,
        availableExercises,
        historyMap: initialHistoryMap,
      });
    }

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
  }, [sessionName, programId, startedAt, sessionNotes, exercises, storageKey, user, initialProgram, userPrograms, availableExercises, initialHistoryMap]);

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

  // Kuras antrean sesi offline: saat app dibuka, saat jaringan kembali online,
  // dan saat service worker meminta flush (Background Sync di Chrome Android).
  useEffect(() => {
    if (!currentUser) return;
    const sync = async () => {
      await flushQueue(currentUser.id, (input) => saveWorkoutSessionAction(input));
      setPending(pendingCount(currentUser.id));
    };
    sync();
    window.addEventListener('online', sync);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'FLUSH_QUEUE') sync();
    };
    navigator.serviceWorker?.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('online', sync);
      navigator.serviceWorker?.removeEventListener('message', onMsg);
    };
  }, [currentUser?.id]);

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

  // Handler update catatan per gerakan
  const handleUpdateExerciseNotes = useCallback((exerciseIndex: number, value: string) => {
    setExercises((prev) => {
      const next = [...prev];
      next[exerciseIndex] = { ...next[exerciseIndex], notes: value };
      return next;
    });
  }, []);

  // Handler centang set selesai -> Picu Timer Istirahat
  //
  // PENTING: setActiveRestTimer TIDAK boleh dipanggil di dalam updater
  // setExercises((prev) => ...). Updater React harus murni — React boleh
  // menjalankan ulang atau membuang hasilnya (StrictMode bahkan sengaja
  // memanggilnya dua kali saat development), sehingga efek samping di dalamnya
  // kadang jalan kadang hilang: timer istirahat jadi kadang muncul kadang tidak.
  // Karena itu status dibaca lewat ref (identitas callback tetap stabil agar
  // ExerciseSetRow yang di-memo tidak ikut re-render), lalu efek sampingnya
  // dijalankan di luar updater.
  const handleToggleComplete = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const targetEx = exercisesRef.current[exerciseIndex];
      const set = targetEx?.sets?.[setIndex];
      if (!targetEx || !set) return;

      const baruSelesai = !set.isCompleted;

      setExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[exerciseIndex] };
        const nextSets = [...ex.sets];
        nextSets[setIndex] = {
          ...nextSets[setIndex],
          isCompleted: !nextSets[setIndex].isCompleted,
        };
        ex.sets = nextSets;
        next[exerciseIndex] = ex;
        return next;
      });

      // Efek samping di LUAR updater: mulai timer istirahat saat set baru selesai
      if (baruSelesai) {
        const restSec = targetEx.restSeconds || restDefault || 90;
        setActiveRestTimer({ key: Date.now(), duration: restSec });
      }
    },
    [restDefault]
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
        avgRecord: targetEx.sets[targetEx.sets.length - 1]?.avgRecord ?? null,
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
            avgRecord: history?.avgSets?.[idx] ?? null,
          };
        });

        next[targetIdx] = {
          exerciseId: newEx.id,
          name: newEx.name,
          primaryMuscle: newEx.primaryMuscle,
          equipment: newEx.equipment,
          weightIncrement: newEx.weightIncrement || 2.5,
          imageUrl: newEx.imageUrl ?? null,
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
          avgRecord: history?.avgSets?.[s] ?? null,
        });
      }

      const newExerciseState: WorkoutExerciseState = {
        exerciseId: newEx.id,
        name: newEx.name,
        primaryMuscle: newEx.primaryMuscle,
        equipment: newEx.equipment,
        weightIncrement: newEx.weightIncrement || 2.5,
        imageUrl: newEx.imageUrl ?? null,
        restSeconds: restDefault || 90,
        historyInfo: history,
        sets,
      };

      setExercises((prev) => [...prev, newExerciseState]);
    }
  };

  // Selesaikan Sesi Latihan — cek target belum tercapai dulu
  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      alert('Tambahkan minimal 1 gerakan latihan sebelum menyelesaikan sesi.');
      return;
    }

    const incomplete = targetStats.filter((t) => t.actualSets < t.targetSets);
    if (incomplete.length > 0) {
      setPendingFinish(incomplete);
      return;
    }

    confirmFinish();
  };

  const confirmFinish = async () => {
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

      const clientSessionId = newClientSessionId();
      let result: Awaited<ReturnType<typeof saveWorkoutSessionAction>>;
      try {
        result = await saveWorkoutSessionAction({ ...payload, id: clientSessionId });
      } catch (err) {
        // Offline / jaringan gagal -> simpan ke antrean perangkat, jangan hilangkan data user.
        // Kunci `clientSessionId` dikirim ke server saat sync sehingga tidak ada sesi dobel.
        const msg = String((err as Error)?.message ?? '');
        if (!navigator.onLine || /fetch|network|timeout/i.test(msg)) {
          if (currentUser) enqueueSession(currentUser.id, { ...payload, clientSessionId });
          localStorage.removeItem(storageKey);
          setPending(currentUser ? pendingCount(currentUser.id) : 0);
          setSummaryData({
            isOpen: true,
            durationSec: elapsedSeconds,
            totalVolume: 0,
            totalSets: completedSetsCount,
            newPRs: [],
            queuedOffline: true,
          });
          return;
        }
        throw err;
      }

      // Bersihkan draft localStorage
      localStorage.removeItem(storageKey);

      // Buka Celebration Summary Modal
      setSummaryData({
        isOpen: true,
        durationSec: elapsedSeconds,
        totalVolume: result.totalVolume,
        totalSets: completedSetsCount,
        newPRs: result.newPRs || [],
        queuedOffline: false,
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

  // Stat Target vs Aktual per gerakan (hanya jika ada target dari program)
  const targetStats: ExerciseTargetStat[] = exercises
    .filter((ex) => ex.targetSets != null && ex.targetSets > 0)
    .map((ex) => {
      const done = ex.sets.filter((s) => s.isCompleted);
      const targetReps =
        ex.targetRepMin && ex.targetRepMax
          ? `${ex.targetRepMin}–${ex.targetRepMax}`
          : ex.targetRepMax != null
            ? String(ex.targetRepMax)
            : undefined;
      return {
        name: ex.name,
        targetSets: ex.targetSets!,
        actualSets: done.length,
        targetReps,
        actualAvgReps: done.length
          ? Math.round(done.reduce((a, s) => a + (Number(s.reps) || 0), 0) / done.length)
          : undefined,
      };
    });

  return (
    <div className="pb-40 max-w-lg mx-auto" style={{ touchAction: 'pan-y' }}>
      {isOffline && (
        <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          <strong>Mode offline</strong> — sesi tersimpan di perangkat dan dikirim otomatis saat online.
        </div>
      )}

      {pending > 0 && (
        <div className="mb-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
          {pending} sesi menunggu dikirim ke server.
        </div>
      )}

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

      {/* Top Header / Sticky Bar — 2 baris: judul utuh di atas, meta di bawah */}
      <div className="sticky top-0 z-30 bg-[#08090a]/95 backdrop-blur-xl border-b border-white/[0.08] -mx-4 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-90 transition-transform shrink-0 touch-manipulation"
            aria-label="Kembali ke beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Session Title Input — baris penuh agar nama sesi tidak terpotong */}
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="flex-1 min-w-0 bg-transparent font-extrabold text-white text-base focus:outline-none truncate"
            placeholder="Nama Sesi Latihan..."
            aria-label="Nama sesi latihan"
          />

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

        {/* Baris meta: timer · volume live · kalkulator plat */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 pl-[3rem]">
          <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold tabular-nums">
            <Timer className="w-3.5 h-3.5" />
            {formatTimer(elapsedSeconds)}
          </span>
          <span aria-hidden="true">•</span>
          <span className="font-mono text-zinc-300 tabular-nums">
            {liveVolume.toLocaleString('id-ID')} kg
          </span>
          <PlateCalculatorSheet className="ml-auto w-9 h-9 rounded-lg bg-transparent border-transparent text-zinc-400" />
          <button
            type="button"
            onClick={() => setIsProgramPickerOpen(true)}
            className="w-9 h-9 rounded-lg bg-transparent border border-white/[0.08] text-zinc-300 flex items-center justify-center active:scale-90 transition-transform hover:text-emerald-400"
            aria-label="Pilih program latihan"
            title="Pilih program latihan"
          >
            <ListChecks className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Pilih Program */}
      {isProgramPickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setIsProgramPickerOpen(false)}
        >
          <div
            className="bg-[#121314] border border-white/[0.08] rounded-3xl w-full max-w-md max-h-[70vh] overflow-y-auto p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white">Pilih Program Latihan</h3>
              <button
                type="button"
                onClick={() => setIsProgramPickerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-zinc-400 active:scale-90"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {userPrograms.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">
                Belum ada program. Buat dulu di tab Latihan.
              </p>
            ) : (
              userPrograms.map((prog: any) => (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => handleSelectProgram(prog)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all active:scale-[0.98] space-y-1',
                    prog.id === programId
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.15]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm truncate">
                      {prog.name}
                    </span>
                    {prog.id === programId && (
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {(prog.exercises || []).length} gerakan
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Daftar Gerakan Latihan */}
      <div className="space-y-4">
        {exercises.length === 0 && initFailed ? (
          /* Server terjangkau TAPI gagal memuat (mis. query timeout P1001).
             Dulu di sini muncul "Belum Ada Gerakan" — menyesatkan: program user
             jelas berisi gerakan, yang gagal hanya pemuatannya. Tampilkan pesan
             jujur + tombol coba lagi, jangan kotak kosong. */
          <div className="bg-amber-500/[0.06] border border-amber-500/25 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-base">Gagal Memuat Gerakan</h3>
              <p className="text-xs text-amber-200/80 max-w-sm mx-auto mt-1 leading-relaxed">
                {requestedProgramId
                  ? 'Program kamu tidak hilang — server gagal memuat datanya (koneksi database lambat). Coba muat ulang halaman.'
                  : 'Server gagal memuat data latihan. Coba muat ulang halaman.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-amber-400 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              Muat Ulang Halaman
            </button>
          </div>
        ) : exercises.length === 0 ? (
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
          exercises.map((ex, exIndex) => {
            // Status ringkas untuk header (dipakai saat kartu terlipat)
            const doneSets = ex.sets.filter((s) => s.isCompleted).length;
            const totalSets = ex.sets.length;
            const allDone = totalSets > 0 && doneSets === totalSets;
            const isExpanded = expandedCardIdx === exIndex;
            return (
            <div
              key={`${ex.exerciseId}_${exIndex}`}
              className={cn(
                'bg-white/[0.03] border rounded-2xl shadow-sm transition-colors',
                isExpanded
                  ? 'border-white/[0.07] p-3.5 space-y-3'
                  : 'border-white/[0.05] p-2.5 space-y-2'
              )}
            >
              {/* Exercise Card Header — tap untuk buka/tutup kartu */}
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleCard(exIndex)}
                  aria-expanded={isExpanded}
                  className="flex items-start gap-2.5 min-w-0 flex-1 text-left active:opacity-80 transition-opacity"
                >
                  {ex.imageUrl && (
                    <span className="relative w-11 h-14 rounded-xl overflow-hidden border border-white/[0.1] bg-[#0f1011] shrink-0 block">
                      <img
                        src={ex.imageUrl}
                        alt={ex.name}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                    {allDone && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[11px] text-zinc-400">
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {MUSCLE_TRANSLATIONS[ex.primaryMuscle]}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{EQUIPMENT_TRANSLATIONS[ex.equipment]}</span>
                    <span aria-hidden="true">•</span>
                    <span className="font-mono whitespace-nowrap">±{ex.weightIncrement}kg</span>
                    {ex.notes && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1 text-amber-400 whitespace-nowrap">
                          <StickyNote className="w-3 h-3" />
                          catatan
                        </span>
                      </>
                    )}
                    {ex.targetSets != null && ex.targetSets > 0 && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span
                          className={`font-mono whitespace-nowrap px-1.5 py-0.5 rounded border ${
                            allDone || doneSets >= ex.targetSets
                              ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                              : 'text-zinc-400 border-white/[0.08] bg-white/[0.04]'
                          }`}
                        >
                          {doneSets}/{ex.targetSets}×
                          {ex.targetRepMin && ex.targetRepMax
                            ? `${ex.targetRepMin}–${ex.targetRepMax}`
                            : (ex.targetRepMax ?? 10)}
                        </span>
                      </>
                    )}
                    {/* Saat kartu terlipat, tampilkan ringkasan set agar tak perlu dibuka */}
                    {!isExpanded && (
                      <span className="font-mono whitespace-nowrap text-zinc-500 tabular-nums">
                        {doneSets}/{totalSets} set
                      </span>
                    )}
                  </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Foto cara gerakan — hanya saat kartu terbuka, supaya
                      menyentuh thumbnail tak bentrok dengan lipatan kartu. */}
                  {isExpanded && ex.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedImageIdx(
                          expandedImageIdx === exIndex ? null : exIndex
                        )
                      }
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-emerald-300 transition-colors"
                      title={expandedImageIdx === exIndex ? 'Tutup foto cara' : 'Lihat foto cara gerakan'}
                      aria-label={`Lihat cara gerakan ${ex.name}`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCard(exIndex)}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 transition-colors"
                    title={isExpanded ? 'Lipat gerakan' : 'Buka gerakan'}
                    aria-label={isExpanded ? `Lipat ${ex.name}` : `Buka ${ex.name}`}
                  >
                    <ChevronDown
                      className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
                    />
                  </button>
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

              {isExpanded && (
              <>
              {/* Expanded: foto posisi awal & akhir */}
              {expandedImageIdx === exIndex && ex.imageUrl && (
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="relative">
                      <img
                        src={ex.imageUrl!.replace(/0\.jpg$/, `${i}.jpg`)}
                        alt={`${ex.name} — posisi ${i === 0 ? 'awal' : 'akhir'}`}
                        loading="lazy"
                        className="w-full aspect-[3/4] object-contain rounded-xl bg-[#0f1011] border border-white/[0.08]"
                      />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-zinc-300">
                        {i === 0 ? 'Awal' : 'Akhir'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

              {/* Sets Table Header — grid identik dengan ExerciseSetRow (kolom mustahil tidak sejajar).
                  Di <340px grid turun ke 3 kolom & label Reps disembunyikan (field Reps ada di baris 2). */}
              <div className="grid grid-cols-[32px_1fr_1fr_36px] max-[340px]:grid-cols-[32px_1fr_36px] gap-1.5 items-center px-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                <span className="text-center">Set</span>
                <span className="text-center">Beban</span>
                <span className="text-center max-[340px]:hidden">Reps</span>
                <span className="text-center" aria-label="Selesai">
                  ✓
                </span>
              </div>

              {/* Set Rows */}
              <div className="space-y-1.5">
                {ex.sets.map((set, sIndex) => (
                  <ExerciseSetRow
                    key={set.id}
                    set={set}
                    index={sIndex}
                    weightIncrement={ex.weightIncrement}
                    // Set aktif = set pertama yang belum dicentang
                    isActive={!set.isCompleted && !ex.sets.slice(0, sIndex).some((s) => !s.isCompleted)}
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

              {/* Catatan gerakan: isi sendiri + riwayat dari sesi sebelumnya */}
              <button
                type="button"
                onClick={() => setOpenNoteIdx(openNoteIdx === exIndex ? null : exIndex)}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] flex items-start gap-2 transition-colors"
              >
                <StickyNote className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', ex.notes ? 'text-amber-400' : 'text-zinc-500')} />
                <span className={cn('text-[11px] flex-1 min-w-0', ex.notes ? 'text-amber-200/90 whitespace-pre-wrap' : 'text-zinc-500')}>
                  {ex.notes || 'Tambah catatan gerakan…'}
                </span>
                {(ex.historyInfo?.noteHistory?.length ?? 0) > 0 && (
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 shrink-0 tabular-nums">
                    {ex.historyInfo?.noteHistory?.length} riwayat
                  </span>
                )}
              </button>

              {openNoteIdx === exIndex && (
                <div className="space-y-2">
                  <textarea
                    value={ex.notes ?? ''}
                    onChange={(e) => handleUpdateExerciseNotes(exIndex, e.target.value)}
                    placeholder="Catatan gerakan (mis. pin no. 5, bahu kiri nyeri, ganti grip lebar…)"
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 resize-none transition-colors"
                  />
                  {(ex.historyInfo?.noteHistory?.length ?? 0) > 0 && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Catatan sebelumnya — tap untuk pakai</p>
                      {ex.historyInfo!.noteHistory.map((n, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleUpdateExerciseNotes(exIndex, n.notes)}
                          className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors"
                        >
                          <span className="text-[9px] font-bold font-mono text-zinc-500 shrink-0 mt-0.5 tabular-nums whitespace-nowrap">
                            {format(new Date(n.date), 'd MMM', { locale: localeId })}
                          </span>
                          <span className="text-[11px] text-zinc-300 flex-1 min-w-0 whitespace-pre-wrap">{n.notes}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              </>
              )}
            </div>
            );
          })
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

        {/* Catatan Sesi */}
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Catatan sesi (perasaan, kondisi tubuh, catatan alat…)"
          rows={2}
          className="w-full px-3.5 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 resize-none transition-colors"
        />
      </div>

      {/* Dialog Konfirmasi Target Belum Tercapai */}
      {pendingFinish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setPendingFinish(null)}
        >
          <div
            className="w-full max-w-sm bg-[#101113] border border-white/[0.1] rounded-2xl p-5 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Belum semua target tercapai</h3>
            <div className="mt-3 space-y-1.5">
              {pendingFinish.map((t) => (
                <p key={t.name} className="text-xs font-semibold text-amber-400">
                  {t.name} {t.actualSets}/{t.targetSets} set
                </p>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPendingFinish(null)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-semibold text-zinc-300 active:scale-[0.98] transition-transform touch-manipulation"
              >
                Lanjutkan Latihan
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingFinish(null);
                  confirmFinish();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-sm font-bold active:scale-[0.98] transition-transform touch-manipulation"
              >
                Tetap Selesai
              </button>
            </div>
          </div>
        </div>
      )}

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
        queuedOffline={summaryData.queuedOffline}
        targetStats={targetStats}
        onClose={() => {
          setSummaryData((prev) => ({ ...prev, isOpen: false }));
          router.push('/riwayat');
        }}
      />
    </div>
  );
}
