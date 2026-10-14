import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProgramsAction, getExercisesAction } from '@/app/actions/latihan-actions';
import { Dumbbell, Layers, Play, Plus, LogOut, ChevronRight } from 'lucide-react';
import { signOutAction } from './login/actions';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  const [programs, exercises] = await Promise.all([
    getProgramsAction(false),
    getExercisesAction(false),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 max-w-md mx-auto px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400">Selamat datang kembali,</p>
          <h1 className="text-xl font-bold text-zinc-100">
            {user?.name || 'Atlet Aniway'} 💪
          </h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/latihan"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold">{programs.length}</p>
            <p className="text-xs text-zinc-400">Program Aktif</p>
          </div>
        </Link>

        <Link
          href="/latihan"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold">{exercises.length}</p>
            <p className="text-xs text-zinc-400">Gerakan Tersedia</p>
          </div>
        </Link>
      </div>

      {/* Mulai Sesi Cepat */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-3">
        <h2 className="font-bold text-base">Siap Latihan Hari Ini?</h2>
        <p className="text-xs text-zinc-300">
          Tidak ada jadwal mingguan kaku. Pilih program di bawah atau mulai sesi latihan kosong kapan saja.
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/workout"
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            Mulai Sesi Kosong
          </Link>
          <Link
            href="/latihan"
            className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Kelola Program
          </Link>
        </div>
      </div>

      {/* Daftar Program Aktif */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-zinc-200">Pilih Program Latihan</h2>
          <Link href="/latihan" className="text-xs text-emerald-400 font-semibold">
            Lihat Semua
          </Link>
        </div>

        {programs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
            <p className="text-sm font-semibold text-zinc-200">
              Belum ada program latihan
            </p>
            <p className="text-xs text-zinc-400">
              Buat program pertama Anda (contoh: Push, Pull, Leg) di menu Latihan.
            </p>
            <Link
              href="/latihan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              Buat Program Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                style={{ borderLeftWidth: '4px', borderLeftColor: prog.color }}
              >
                <Link href={`/latihan/program/${prog.id}`} className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-zinc-100">{prog.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {prog.exercises.length} gerakan terdaftar
                  </p>
                </Link>
                <Link
                  href={`/workout?programId=${prog.id}`}
                  style={{ backgroundColor: prog.color }}
                  className="px-3.5 py-2 rounded-xl text-zinc-950 font-bold text-xs flex items-center gap-1 shrink-0"
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
