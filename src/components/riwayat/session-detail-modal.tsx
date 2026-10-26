'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import {
  X,
  Clock,
  Dumbbell,
  Flame,
  Calendar,
  Edit2,
  Trash2,
  Check,
  Trophy,
  Loader2,
  FolderPlus,
  StickyNote,
} from 'lucide-react';
import { SetType } from '@prisma/client';
import {
  deleteWorkoutSessionAction,
  updateWorkoutSessionAction,
  updateSetLogAction,
} from '@/app/actions/riwayat-actions';
import { saveSessionAsProgramAction } from '@/app/actions/latihan-actions';
import { MUSCLE_TRANSLATIONS, PROGRAM_COLORS } from '@/lib/constants';
import { toKg, toDisplayWeight, roundWeight, weightUnitLabel } from '@/lib/units';

interface SessionDetailModalProps {
  session: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  /** Satuan tampilan user ('KG' | 'LB'); nilai di DB tetap kanonik KG. */
  weightUnit?: string;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  weightUnit,
}: SessionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savingSetId, setSavingSetId] = useState<string | null>(null);
  const [setError, setSetError] = useState<{ id: string; message: string } | null>(
    null
  );
  const [showSaveProgram, setShowSaveProgram] = useState(false);
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progColor, setProgColor] = useState(PROGRAM_COLORS[0].value);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);

  useEffect(() => {
    setShowSaveProgram(false);
    setSavedProgramId(null);
  }, [session?.id, isOpen]);

  if (!isOpen || !session) return null;

  const openSaveProgram = () => {
    // Sesi yang berasal dari program diberi sufiks supaya tidak dobel nama di daftar program
    setProgName(session.programId ? `${session.name} (Salinan)` : session.name);
    setProgDesc('');
    setProgColor(PROGRAM_COLORS[0].value);
    setSavedProgramId(null);
    setShowSaveProgram(true);
  };

  const handleSaveProgram = async () => {
    try {
      setIsLoading(true);
      const res = await saveSessionAsProgramAction({
        sessionId: session.id,
        name: progName,
        description: progDesc || undefined,
        color: progColor,
      });
      setSavedProgramId(res.programId);
      setShowSaveProgram(false);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan program.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBlur = async (
    setId: string,
    field: 'weight' | 'reps',
    defaultValue: number,
    rawValue: string,
    currentWeight: number,
    currentReps: number
  ) => {
    const value = Number(rawValue);
    if (Number.isNaN(value) || value === defaultValue) return;
    if (savingSetId) return;

    try {
      setSavingSetId(setId);
      setSetError(null);
      await updateSetLogAction(setId, {
        weight: field === 'weight' ? toKg(value, weightUnit) : currentWeight,
        reps: field === 'reps' ? value : currentReps,
      });
      onUpdated();
    } catch (err: any) {
      setSetError({ id: setId, message: err.message || 'Gagal menyimpan set.' });
    } finally {
      setSavingSetId(null);
    }
  };

  const startEdit = () => {
    setEditName(session.name);
    setEditNotes(session.notes || '');
    setEditDate(format(new Date(session.startedAt), "yyyy-MM-dd'T'HH:mm"));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      await updateWorkoutSessionAction(session.id, {
        name: editName,
        notes: editNotes,
        startedAt: editDate ? new Date(editDate).toISOString() : undefined,
      });
      setIsEditing(false);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah data sesi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Yakin ingin menghapus riwayat sesi "${session.name}"? Data set yang tersimpan akan ikut terhapus.`)) {
      try {
        setIsLoading(true);
        await deleteWorkoutSessionAction(session.id);
        onClose();
        onDeleted();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus sesi.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hrs > 0 ? `${hrs} jam ${remMins} mnt` : `${mins} menit`;
  };

  const getSetTypeBadge = (type: SetType) => {
    switch (type) {
      case SetType.WARMUP:
        return <span className="text-amber-400 font-bold text-[10px]">W</span>;
      case SetType.DROPSET:
        return <span className="text-purple-400 font-bold text-[10px]">D</span>;
      case SetType.FAILURE:
        return <span className="text-rose-400 font-bold text-[10px]">F</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-sm font-bold text-[var(--fg-strong)]"
              />
            ) : (
              <h3 className="font-bold text-[var(--fg-strong)] text-base truncate">{session.name}</h3>
            )}
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {format(new Date(session.startedAt), 'EEEE, d MMMM yyyy • HH:mm', { locale: id })}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={openSaveProgram}
                  disabled={!session.exercises?.length}
                  className="p-1.5 text-[var(--muted)] hover:text-emerald-300 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-40"
                  title="Simpan sebagai program latihan"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={startEdit}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--fg)] rounded-lg hover:bg-[var(--surface-2)]"
                  title="Edit data sesi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-[var(--muted)] hover:text-rose-400 rounded-lg hover:bg-[var(--surface-2)]"
                  title="Hapus sesi latihan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-emerald-500 text-zinc-950 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--muted)] hover:text-[var(--fg)] rounded-lg hover:bg-[var(--surface-2)] ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedProgramId && (
          <div className="mx-5 mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-emerald-300">✓ Tersimpan sebagai program</p>
            <div className="flex gap-2">
              <Link
                href={`/latihan/program/${savedProgramId}`}
                className="flex-1 text-center px-3 py-2 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-xs font-bold text-[var(--fg-strong)]"
              >
                Lihat Program
              </Link>
              <Link
                href={`/workout?programId=${savedProgramId}`}
                className="flex-1 text-center px-3 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold"
              >
                Mulai Latihan
              </Link>
            </div>
          </div>
        )}
        {showSaveProgram && !savedProgramId && (
          <div className="mx-5 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-2.5">
            <p className="text-xs font-bold text-[var(--fg-strong)]">Simpan sebagai Program</p>
            <input
              type="text"
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              placeholder="Nama program"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-xs text-[var(--fg-strong)] focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={progDesc}
              onChange={(e) => setProgDesc(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-xs text-[var(--fg-strong)] focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1.5 flex-wrap">
              {PROGRAM_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setProgColor(c.value)}
                  className={`w-6 h-6 rounded-full transition ${progColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)]' : ''}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Warna ${c.value}`}
                />
              ))}
            </div>
            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setShowSaveProgram(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-xs font-bold text-[var(--fg-soft)]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoading || progName.trim().length < 2}
                onClick={handleSaveProgram}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Simpan Program'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Edit Form Additions */}
          {isEditing && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)]">Tanggal & Jam</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg-strong)] mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)]">Catatan Latihan</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Tambah catatan..."
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg-strong)] mt-1 resize-none"
                />
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--muted)]">Durasi</p>
                <p className="font-bold text-sm text-[var(--fg-strong)]">
                  {formatDuration(session.durationSec)}
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--muted)]">Total Volume</p>
                <p className="font-bold text-sm text-emerald-400 font-mono">
                  {Math.round(toDisplayWeight(session.totalVolume, weightUnit)).toLocaleString('id-ID')} {weightUnitLabel(weightUnit)}
                </p>
              </div>
            </div>
          </div>

          {/* Session Notes if exists */}
          {!isEditing && session.notes && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--fg-soft)]">
              <span className="font-bold text-[var(--muted)] block mb-0.5">Catatan:</span>
              <p className="leading-relaxed whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}

          {/* Exercise & Sets Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Rincian Gerakan & Set
            </h4>

            {session.exercises.map((se: any, idx: number) => (
              <div
                key={se.id || idx}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--surface-2)] text-[11px] font-bold flex items-center justify-center text-[var(--fg-soft)]">
                      {idx + 1}
                    </span>
                    <h5 className="font-bold text-sm text-[var(--fg-strong)]">{se.exercise?.name}</h5>
                  </div>
                  {se.exercise?.primaryMuscle && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {MUSCLE_TRANSLATIONS[se.exercise.primaryMuscle]}
                    </span>
                  )}
                </div>

                {/* Table of sets */}
                <div className="divide-y divide-[var(--border)] border-t border-[var(--border)] pt-1 text-xs">
                  {se.sets.map((set: any) => (
                    <div
                      key={set.id}
                      className={`py-1.5 flex flex-col ${
                        savingSetId === set.id ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[var(--fg-soft)]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[var(--muted-strong)] font-mono w-5">
                            #{set.setNumber}
                          </span>
                          {getSetTypeBadge(set.setType)}
                          <input
                            type="number"
                            inputMode="decimal"
                            defaultValue={roundWeight(set.weight, weightUnit)}
                            disabled={savingSetId !== null}
                            onBlur={(e) =>
                              handleSetBlur(
                                set.id,
                                'weight',
                                roundWeight(set.weight, weightUnit),
                                e.target.value,
                                set.weight,
                                set.reps
                              )
                            }
                            className="w-16 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] px-2 py-1 text-sm tabular-nums text-[var(--fg-strong)]"
                          />
                          <span className="text-[var(--muted)]">{weightUnitLabel(weightUnit)} ×</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            defaultValue={set.reps}
                            disabled={savingSetId !== null}
                            onBlur={(e) =>
                              handleSetBlur(
                                set.id,
                                'reps',
                                set.reps,
                                e.target.value,
                                set.weight,
                                set.reps
                              )
                            }
                            className="w-16 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] px-2 py-1 text-sm tabular-nums text-[var(--fg-strong)]"
                          />
                          <span className="text-[var(--muted)]">reps</span>
                          {savingSetId === set.id && (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {set.estimated1RM > 0 && (
                            <span className="text-[10px] text-[var(--muted-strong)] font-mono">
                              Est 1RM: {roundWeight(set.estimated1RM, weightUnit)}{weightUnitLabel(weightUnit)}
                            </span>
                          )}
                          {set.isPersonalRecord && (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              <Trophy className="w-3 h-3 text-amber-400" />
                              PR
                            </span>
                          )}
                        </div>
                      </div>
                      {setError && setError.id === set.id && (
                        <p className="text-[10px] text-rose-400 mt-0.5">
                          {setError.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Catatan gerakan (tersimpan saat latihan) */}
                {se.notes && (
                  <div className="flex items-start gap-2 bg-amber-500/[0.07] border border-amber-500/20 rounded-lg px-2.5 py-2">
                    <StickyNote className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-100/90 leading-relaxed whitespace-pre-wrap flex-1 min-w-0">
                      {se.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
