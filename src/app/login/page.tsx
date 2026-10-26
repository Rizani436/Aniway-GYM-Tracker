'use client';

import { useState, useTransition } from 'react';
import { Dumbbell, Loader2, Mail, Lock, User, Zap } from 'lucide-react';
import { loginWithEmail, signupWithEmail } from './actions';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = mode === 'login' ? loginWithEmail : signupWithEmail;
      const res = await action(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
          <Dumbbell className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Aniway Tracker
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--fg)]">
          {mode === 'login' ? 'Selamat Datang' : 'Mulai Perjalanan'}
        </h1>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-xs leading-relaxed">
          Catat progressive overload mesin gym dengan cepat & presisi.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              mode === 'login'
                ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              mode === 'register'
                ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Nama Panggilan
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--muted-strong)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Budi"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--input)] border border-[var(--border)] focus:border-emerald-500 rounded-xl text-sm text-[var(--fg)] placeholder-[var(--muted-strong)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted-strong)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--input)] border border-[var(--border)] focus:border-emerald-500 rounded-xl text-sm text-[var(--fg)] placeholder-[var(--muted-strong)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--muted-strong)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--input)] border border-[var(--border)] focus:border-emerald-500 rounded-xl text-sm text-[var(--fg)] placeholder-[var(--muted-strong)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isGoogleLoading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_16px_rgba(16,185,129,0.3)] pt-3"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[var(--bg-soft)] px-2.5 text-[var(--muted-strong)]">Atau</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending || isGoogleLoading}
          className="w-full py-2.5 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg)] font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
          )}
          Lanjutkan dengan Google
        </button>
      </div>
    </div>
  );
}
