import { getAuthenticatedUser } from '@/lib/supabase/server';
import { signOutAction } from '@/app/login/actions';
import { User, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilPlaceholderPage() {
  const user = await getAuthenticatedUser();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 max-w-md mx-auto px-4 pt-8 space-y-5">
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate">{user?.name || 'Pengguna'}</h1>
          <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
        Pengaturan satuan (kg/lb), default rest timer, ekspor/impor JSON & CSV, serta grafik progres dan berat badan akan ditambahkan pada Tahap 4 & 5.
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun
        </button>
      </form>
    </main>
  );
}
