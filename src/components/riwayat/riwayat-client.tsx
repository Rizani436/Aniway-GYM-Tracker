'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Flame,
  Trophy,
  Dumbbell,
  Clock,
  Plus,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { ActivityHeatmap } from './activity-heatmap';
import { SessionDetailModal } from './session-detail-modal';
import { ManualSessionModal } from './manual-session-modal';

interface RiwayatClientProps {
  initialSessions: any[];
  stats: {
    totalSessions: number;
    totalLifetimeVolume: number;
    totalPRs: number;
    currentStreak: number;
  };
  heatmapData: Array<{
    date: string;
    count: number;
    volume: number;
  }>;
  availableExercises: any[];
  /** Program aktif yang sudah lama tidak dilatih (≥7 hari) atau belum pernah. */
  programJatuhTempo?: Array<{
    id: string;
    name: string;
    color: string;
    hariLalu: number | null;
    jumlahGerakan: number;
  }>;
}

export function RiwayatClient({
  initialSessions,
  stats,
  heatmapData,
  availableExercises,
  programJatuhTempo = [],
}: RiwayatClientProps) {
  const router = useRouter();
  const [sessions] = useState(initialSessions);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchExercise = s.exercises?.some((e: any) =>
        e.exercise?.name.toLowerCase().includes(search.toLowerCase())
      );
      return matchName || matchExercise;
    });
  }, [sessions, search]);

  const handleRefresh = () => {
    router.refresh();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}j ${remMins}m`;
    return `${mins} mnt`;
  };

  return (
    <div className="pb-28 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Riwayat Latihan</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Jejak konsistensi & progres angkatan kamu</p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Catat Manual</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Streak */}
        <div className="bg-gradient-to-b from-[#1b1508] to-[#120e06] border border-amber-500/25 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-amber-300">Streak Latihan</p>
            <p className="text-xl font-extrabold text-white font-mono">
              {stats.currentStreak} <span className="text-xs font-normal text-zinc-400">Hari</span>
            </p>
          </div>
        </div>

        {/* Total Sesi */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Total Sesi</p>
            <p className="text-xl font-extrabold text-white font-mono">
              {stats.totalSessions} <span className="text-xs font-normal text-zinc-400">Sesi</span>
            </p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Beban Angkat</p>
            <p className="text-lg font-extrabold text-white font-mono">
              {stats.totalLifetimeVolume >= 1000
                ? `${(stats.totalLifetimeVolume / 1000).toFixed(1)}k`
                : stats.totalLifetimeVolume}{' '}
              <span className="text-xs font-normal text-zinc-400">kg</span>
            </p>
          </div>
        </div>

        {/* Total PRs */}
        <Link
          href="/riwayat/pr"
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Rekor Baru (PR)</p>
            <p className="text-xl font-extrabold text-white font-mono">
              {stats.totalPRs} <span className="text-xs font-normal text-zinc-400">Kali</span>
            </p>
            <p className="text-[10px] font-medium text-emerald-400">Lihat PR →</p>
          </div>
        </Link>
      </div>

      {/* Pengingat: program yang sudah lama tidak dilatih.
          Dihitung dari tanggal sesi yang sudah ada — bukan jadwal yang ditebak. */}
      {programJatuhTempo.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-amber-200">
              Sudah lama tidak dilatih
            </p>
          </div>
          <div className="space-y-1.5">
            {programJatuhTempo.slice(0, 3).map((prog) => (
              <Link
                key={prog.id}
                href={`/workout?programId=${prog.id}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] active:scale-[0.99] transition-transform touch-manipulation"
              >
                <span
                  className="w-1.5 h-7 rounded-full shrink-0"
                  style={{ backgroundColor: prog.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-white truncate">{prog.name}</span>
                  <span className="block text-[10px] text-zinc-400">
                    {prog.hariLalu === null
                      ? `Belum pernah dilatih · ${prog.jumlahGerakan} gerakan`
                      : `${prog.hariLalu} hari lalu · ${prog.jumlahGerakan} gerakan`}
                  </span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 shrink-0">Mulai →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* Sesi List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Daftar Sesi ({filteredSessions.length})
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sesi atau gerakan..."
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Cards */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs text-zinc-400">
              Belum ada riwayat sesi yang cocok. Mulai workout atau catat manual.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const hasPR = session.exercises?.some((e: any) =>
                e.sets?.some((s: any) => s.isPersonalRecord)
              );

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    setIsDetailOpen(true);
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-3.5 transition-all cursor-pointer shadow-sm group active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {session.name}
                        </h3>
                        {session.program && (
                          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            {session.program.name}
                          </span>
                        )}
                        {hasPR && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            <Trophy className="w-2.5 h-2.5 text-amber-400" />
                            PR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {format(new Date(session.startedAt), 'EEEE, d MMMM yyyy • HH:mm', {
                          locale: id,
                        })}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/[0.06] text-xs">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDuration(session.durationSec)}</span>
                    </div>
                    <span className="text-zinc-700">•</span>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono font-medium text-emerald-400">
                        {session.totalVolume.toLocaleString('id-ID')} kg
                      </span>
                    </div>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-400 font-mono">
                      {session.exercises?.length || 0} gerakan
                    </span>
                  </div>

                  {/* Exercises mini tags */}
                  {session.exercises && session.exercises.length > 0 && (
                    <div className="mt-2 text-[11px] text-zinc-500 truncate">
                      {session.exercises.map((e: any) => e.exercise?.name).join(' • ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSession(null);
        }}
        onUpdated={handleRefresh}
        onDeleted={handleRefresh}
      />

      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        availableExercises={availableExercises}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
