'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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
} from 'lucide-react';
import { SetType } from '@prisma/client';
import {
  deleteWorkoutSessionAction,
  updateWorkoutSessionAction,
  updateSetLogAction,
} from '@/app/actions/riwayat-actions';
import { MUSCLE_TRANSLATIONS } from '@/lib/constants';

interface SessionDetailModalProps {
  session: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
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

  if (!isOpen || !session) return null;

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
        weight: field === 'weight' ? value : currentWeight,
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm font-bold text-zinc-100"
              />
            ) : (
              <h3 className="font-bold text-zinc-100 text-base truncate">{session.name}</h3>
            )}
            <p className="text-xs text-zinc-400 mt-0.5">
              {format(new Date(session.startedAt), 'EEEE, d MMMM yyyy • HH:mm', { locale: id })}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  title="Edit data sesi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800"
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
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Edit Form Additions */}
          {isEditing && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Tanggal & Jam</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Catatan Latihan</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Tambah catatan..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 mt-1 resize-none"
                />
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Durasi</p>
                <p className="font-bold text-sm text-zinc-100">
                  {formatDuration(session.durationSec)}
                </p>
              </div>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Total Volume</p>
                <p className="font-bold text-sm text-emerald-400 font-mono">
                  {session.totalVolume.toLocaleString('id-ID')} kg
                </p>
              </div>
            </div>
          </div>

          {/* Session Notes if exists */}
          {!isEditing && session.notes && (
            <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-3 text-xs text-zinc-300">
              <span className="font-bold text-zinc-400 block mb-0.5">Catatan:</span>
              <p className="leading-relaxed whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}

          {/* Exercise & Sets Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Rincian Gerakan & Set
            </h4>

            {session.exercises.map((se: any, idx: number) => (
              <div
                key={se.id || idx}
                className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-800 text-[11px] font-bold flex items-center justify-center text-zinc-300">
                      {idx + 1}
                    </span>
                    <h5 className="font-bold text-sm text-zinc-100">{se.exercise?.name}</h5>
                  </div>
                  {se.exercise?.primaryMuscle && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {MUSCLE_TRANSLATIONS[se.exercise.primaryMuscle]}
                    </span>
                  )}
                </div>

                {/* Table of sets */}
                <div className="divide-y divide-zinc-900 border-t border-zinc-900 pt-1 text-xs">
                  {se.sets.map((set: any) => (
                    <div
                      key={set.id}
                      className={`py-1.5 flex flex-col ${
                        savingSetId === set.id ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 font-mono w-5">
                            #{set.setNumber}
                          </span>
                          {getSetTypeBadge(set.setType)}
                          <input
                            type="number"
                            inputMode="decimal"
                            defaultValue={set.weight}
                            disabled={savingSetId !== null}
                            onBlur={(e) =>
                              handleSetBlur(
                                set.id,
                                'weight',
                                set.weight,
                                e.target.value,
                                set.weight,
                                set.reps
                              )
                            }
                            className="w-16 rounded-lg bg-white/[0.05] border border-white/[0.1] px-2 py-1 text-sm tabular-nums text-zinc-100"
                          />
                          <span className="text-zinc-400">kg ×</span>
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
                            className="w-16 rounded-lg bg-white/[0.05] border border-white/[0.1] px-2 py-1 text-sm tabular-nums text-zinc-100"
                          />
                          <span className="text-zinc-400">reps</span>
                          {savingSetId === set.id && (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {set.estimated1RM > 0 && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Est 1RM: {set.estimated1RM}kg
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
