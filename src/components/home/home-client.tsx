'use client';

import Link from 'next/link';
import { signOutAction } from '@/app/login/actions';
import { Dumbbell, Layers, Play, Plus, LogOut, ChevronRight, Zap, Repeat, TrendingUp, Trophy } from 'lucide-react';
import { useHomeData, type HomeData } from '@/hooks/use-home-data';
import { toDisplayWeight, weightUnitLabel } from '@/lib/units';

type HomeUser = { name?: string | null; weightUnit?: string | null } | null;

export function HomeClient({ data, user }: { data: HomeData; user: HomeUser }) {
  // initialData dari server → first paint identik; revisit hit cache lokal.
  const { data: home } = useHomeData(data);
  const { programs, exerciseCount, lastSession, weekRecap, prCount } = home;

  const { thisWeek, lastWeek } = weekRecap;
  const volumeDelta =
    thisWeek.sessions === 0 || lastWeek.sessions === 0
      ? null
      : Math.round(((thisWeek.volume - lastWeek.volume) / lastWeek.volume) * 100);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 max-w-md mx-auto px-4 pt-[max(1.5rem,env(safe-area-inset-top))] space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Aniway Tracker
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">
            {user?.name || 'Sobat Besi'}
          </h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] active:scale-90 transition-transform flex items-center justify-center touch-manipulation"
            title="Keluar"
            aria-label="Keluar dari akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/latihan"
          className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] active:scale-[0.98] transition-transform flex items-center gap-3 touch-manipulation"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-[var(--fg)] leading-none tabular-nums">
              {programs.length}
            </p>
            <p className="text-[11px] text-[var(--muted)] font-medium mt-1 truncate">Program Aktif</p>
          </div>
        </Link>

        <Link
          href="/latihan"
          className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] active:scale-[0.98] transition-transform flex items-center gap-3 touch-manipulation"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-[var(--fg)] leading-none tabular-nums">
              {exerciseCount}
            </p>
            <p className="text-[11px] text-[var(--muted)] font-medium mt-1 truncate">Gerakan Mesin</p>
          </div>
        </Link>

        {/* Pintasan PR — halaman /riwayat/pr sudah ada, sebelumnya tanpa jalan masuk
            dari Home sehingga praktis tak terjangkau. */}
        {prCount > 0 && (
          <Link
            href="/riwayat/pr"
            className="col-span-2 p-3.5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 active:scale-[0.98] transition-transform flex items-center gap-3 touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold tracking-tight text-[var(--fg)] leading-none tabular-nums">
                {prCount} Rekor Pribadi
              </p>
              <p className="text-[11px] text-amber-200/70 font-medium mt-1">
                Gerakan yang sudah kamu pecahkan rekornya
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400/70 shrink-0" />
          </Link>
        )}
      </div>

      {/* Rekap Mingguan */}
      {thisWeek.sessions > 0 && (
        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-[var(--fg)] leading-none tabular-nums">
                {thisWeek.sessions} sesi · {Math.round(toDisplayWeight(thisWeek.volume, user?.weightUnit)).toLocaleString('id-ID')} {weightUnitLabel(user?.weightUnit)}
              </p>
              <p className="text-[11px] text-[var(--muted)] font-medium mt-1">Volume 7 hari terakhir</p>
            </div>
          </div>
          {lastWeek.sessions === 0 ? (
            <span className="px-2 py-1 rounded-lg bg-[var(--card-hover)] text-[10px] font-semibold text-[var(--muted)] shrink-0">
              minggu pertama
            </span>
          ) : volumeDelta !== null && volumeDelta >= 0 ? (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 tabular-nums shrink-0">
              ▲{volumeDelta}%
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 tabular-nums shrink-0">
              ▼{Math.abs(volumeDelta ?? 0)}%
            </span>
          )}
        </div>
      )}

      {/* Mulai Sesi Cepat Hero Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-b from-[var(--hero-from)] to-[var(--hero-to)] border border-emerald-500/25 shadow-[0_12px_40px_rgba(16,185,129,0.08)] space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4 fill-emerald-400/30" />
          </div>
          <h2 className="font-bold text-sm tracking-tight text-[var(--fg)]">Sesi Latihan Baru</h2>
        </div>
        <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
          Catat set, repetisi, dan beban secara instan dengan rest timer audio otomatis dan wake lock layar.
        </p>
        {lastSession ? (
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              href="/workout"
              className="py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-transform touch-manipulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mulai Sesi Kosong
            </Link>
            <Link
              href="/latihan"
              className="px-4 py-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-strong)] font-semibold text-xs flex items-center justify-center gap-1 active:scale-[0.98] transition-transform touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" />
              Program
            </Link>
            <Link
              href={`/workout?repeatSessionId=${lastSession.id}`}
              className="col-span-2 py-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-strong)] font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform touch-manipulation"
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[220px]">
                Ulangi: {lastSession.name || 'Sesi Terakhir'}
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 pt-0.5">
            <Link
              href="/workout"
              className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-transform touch-manipulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Mulai Sesi Kosong
            </Link>
            <Link
              href="/latihan"
              className="px-4 py-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-strong)] font-semibold text-xs flex items-center gap-1 active:scale-[0.98] transition-transform touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" />
              Program
            </Link>
          </div>
        )}
      </div>

      {/* Daftar Program Aktif */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)]">
            Program Rutin Kamu
          </h2>
          <Link
            href="/latihan"
            className="text-xs text-emerald-400 font-medium flex items-center gap-0.5 active:scale-95 transition-transform touch-manipulation"
          >
            Kelola
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {programs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
            <p className="text-sm font-semibold text-[var(--fg-soft)]">Belum ada program latihan</p>
            <p className="text-xs text-[var(--muted)]">
              Buat program pertama Anda (contoh: Push, Pull, Leg) untuk memulai.
            </p>
            <Link
              href="/latihan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs active:scale-95 transition-transform touch-manipulation"
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
                className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: prog.color }}
                  />
                  <Link
                    href={`/latihan/program/${prog.id}`}
                    className="min-w-0 flex-1 active:opacity-70 transition-opacity"
                  >
                    <h3 className="font-semibold text-sm text-[var(--fg)] truncate">{prog.name}</h3>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      {prog.exerciseCount} gerakan terdaftar
                    </p>
                  </Link>
                </div>
                <Link
                  href={`/workout?programId=${prog.id}`}
                  style={{ backgroundColor: prog.color }}
                  className="px-3 h-9 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-transform touch-manipulation"
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
