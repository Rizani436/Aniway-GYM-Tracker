import { getAuthenticatedUser } from '@/lib/supabase/server';
import { signOutAction } from '@/app/login/actions';
import { getBodyWeightLogsAction } from '@/app/actions/statistik-actions';
import { BodyWeightCard } from '@/components/profil/body-weight-card';
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

  return (
    <main className="min-h-screen bg-[#08090a] text-[#f7f8f8] pb-28 max-w-md mx-auto px-4 pt-6 space-y-4">
      <div className="pt-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Profil Akun</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Kelola identitas dan preferensi latihan kamu</p>
      </div>

      {/* User Card */}
      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3.5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-sm text-white truncate">{user?.name || 'Sobat Besi'}</h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Aktif
            </span>
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Berat Badan */}
      <BodyWeightCard data={data} />

      {/* App Info Box */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Tentang Aniway Tracker</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
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
