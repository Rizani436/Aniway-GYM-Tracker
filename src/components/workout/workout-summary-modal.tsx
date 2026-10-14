'use client';

import Link from 'next/link';
import { Trophy, Clock, Dumbbell, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import type { NewPRInfo } from '@/app/actions/workout-actions';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  durationSec: number;
  totalVolume: number;
  totalSets: number;
  newPRs: NewPRInfo[];
  onClose: () => void;
}

export function WorkoutSummaryModal({
  isOpen,
  durationSec,
  totalVolume,
  totalSets,
  newPRs,
  onClose,
}: WorkoutSummaryModalProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const durationStr =
    hours > 0 ? `${hours} jam ${remainingMinutes} mnt` : `${minutes} mnt ${seconds} dtk`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-6">
        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 text-zinc-950">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
            Latihan Selesai! 🔥
          </h2>
          <p className="text-sm text-zinc-400">
            Sesi latihan berhasil disimpan ke database. Konsistensi hari ini luar biasa!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 text-center">
            <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] text-zinc-500">Durasi</p>
            <p className="font-bold text-sm text-zinc-200">{durationStr}</p>
          </div>
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 text-center">
            <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] text-zinc-500">Total Volume</p>
            <p className="font-bold text-sm text-emerald-400 font-mono">
              {totalVolume.toLocaleString('id-ID')} kg
            </p>
          </div>
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 text-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] text-zinc-500">Set Selesai</p>
            <p className="font-bold text-sm text-zinc-200 font-mono">{totalSets} Set</p>
          </div>
        </div>

        {/* New PRs Section */}
        {newPRs.length > 0 && (
          <div className="space-y-2 text-left bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wide">
                Rekor Personal Baru Tercipta! ({newPRs.length})
              </h4>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
              {newPRs.map((pr, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/80 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-zinc-100">{pr.exerciseName}</p>
                    <p className="text-zinc-400">
                      {pr.weight} kg × {pr.reps} reps
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-amber-500/20 text-amber-300 font-bold font-mono px-2 py-0.5 rounded-md border border-amber-500/30">
                      Est 1RM: {pr.new1RM} kg
                    </span>
                    {pr.previousBest1RM > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Sebelum: {pr.previousBest1RM} kg
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/riwayat"
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <span>Lihat Riwayat & Kalender</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
          <Link
            href="/"
            onClick={onClose}
            className="w-full py-2.5 px-4 text-zinc-400 hover:text-zinc-200 text-xs font-semibold block transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
