import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProgramsAction, getExercisesAction } from '@/app/actions/latihan-actions';
import { Dumbbell, Layers, Play, Plus, LogOut, ChevronRight, Zap } from 'lucide-react';
import { signOutAction } from './login/actions';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  const [programs, exercises] = await Promise.all([
    getProgramsAction(false),
    getExercisesAction(false),
  ]);

  return (
    <main className="min-h-screen bg-[#08090a] text-[#f7f8f8] pb-28 max-w-md mx-auto px-4 pt-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Aniway Tracker
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            {user?.name || 'Sobat Besi'}
          </h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-red-400 active:scale-95 transition-all"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/latihan"
          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-white leading-none">
              {programs.length}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium mt-1 truncate">Program Aktif</p>
          </div>
        </Link>

        <Link
          href="/latihan"
          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-white leading-none">
              {exercises.length}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium mt-1 truncate">Gerakan Mesin</p>
          </div>
        </Link>
      </div>

      {/* Mulai Sesi Cepat Hero Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-b from-[#131715] to-[#0c0e0d] border border-emerald-500/25 shadow-[0_12px_40px_rgba(16,185,129,0.08)] space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4 fill-emerald-400/30" />
          </div>
          <h2 className="font-bold text-sm tracking-tight text-white">Sesi Latihan Baru</h2>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Catat set, repetisi, dan beban secara instan dengan rest timer audio otomatis dan wake lock layar.
        </p>
        <div className="flex gap-2 pt-0.5">
          <Link
            href="/workout"
            className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Mulai Sesi Kosong
          </Link>
          <Link
            href="/latihan"
            className="px-4 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.98] border border-white/[0.1] text-zinc-200 font-semibold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Program
          </Link>
        </div>
      </div>

      {/* Daftar Program Aktif */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
            Program Rutin Kamu
          </h2>
          <Link
            href="/latihan"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 transition-colors"
          >
            Kelola
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {programs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
            <p className="text-sm font-semibold text-zinc-300">
              Belum ada program latihan
            </p>
            <p className="text-xs text-zinc-400">
              Buat program pertama Anda (contoh: Push, Pull, Leg) untuk memulai.
            </p>
            <Link
              href="/latihan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Buat Program Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-8 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: prog.color }}
                  />
                  <Link href={`/latihan/program/${prog.id}`} className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {prog.exercises.length} gerakan terdaftar
                    </p>
                  </Link>
                </div>
                <Link
                  href={`/workout?programId=${prog.id}`}
                  style={{ backgroundColor: prog.color }}
                  className="px-3 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 shadow-sm transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mulai
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
