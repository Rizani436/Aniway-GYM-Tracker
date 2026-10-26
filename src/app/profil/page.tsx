import { getAuthenticatedUser } from '@/lib/supabase/server';
import { signOutAction } from '@/app/login/actions';
import {
  getBodyWeightLogsAction,
  getMuscleVolumeAction,
} from '@/app/actions/statistik-actions';
import { BodyWeightCard } from '@/components/profil/body-weight-card';
import { MuscleVolumeCard } from '@/components/profil/muscle-volume-card';
import { SettingsCard } from '@/components/profil/settings-card';
import { WeightUnit, ThemeMode } from '@prisma/client';
import { User, LogOut, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const user = await getAuthenticatedUser();
  let data;
  try {
    data = await getBodyWeightLogsAction();
  } catch {
    data = { logs: [], trend7d: null, latest: null };
  }

  let muscleVolume: Awaited<ReturnType<typeof getMuscleVolumeAction>> = [];
  try {
    muscleVolume = await getMuscleVolumeAction();
  } catch {
    // DB flaky: kartu tampil empty state, jangan crash halaman profil.
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 max-w-md mx-auto px-4 pt-6 space-y-4">
      <div className="pt-1">
        <h1 className="text-xl font-extrabold text-[var(--fg)] tracking-tight">Profil Akun</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">Kelola identitas dan preferensi latihan kamu</p>
      </div>

      {/* User Card */}
      <div className="p-4 rounded-3xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3.5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-sm text-[var(--fg)] truncate">{user?.name || 'Sobat Besi'}</h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Aktif
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Pengaturan Latihan (satuan, istirahat default, tema) */}
      <SettingsCard
        initialWeightUnit={user?.weightUnit ?? WeightUnit.KG}
        initialRestTimer={user?.defaultRestTimer ?? 90}
        initialTheme={user?.theme ?? ThemeMode.DARK}
      />

      {/* Berat Badan */}
      <BodyWeightCard data={data} weightUnit={user?.weightUnit} />

      {/* Volume per Otot (initial 7 hari, toggle 7/30 di client) */}
      <MuscleVolumeCard initialData={muscleVolume} weightUnit={user?.weightUnit} />

      {/* App Info Box */}
      <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-soft)]">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Tentang Aniway Tracker</span>
        </div>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Aplikasi gym tracker Indonesia dengan fokus progressive overload pada mesin gym, timer audio otomatis, dan pencatatan riwayat sesi.
        </p>
      </div>

      {/* Logout Action */}
      <form action={signOutAction} className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun
        </button>
      </form>
    </main>
  );
}
