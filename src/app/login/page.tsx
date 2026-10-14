'use client';

import { useState, useTransition } from 'react';
import { Dumbbell, Loader2, Mail, Lock, User } from 'lucide-react';
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center px-5 py-10 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Aniway Gym Tracker</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Catat beban, pantau progressive overload, raih PR baru.
        </p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-sm font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
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
            className={`py-2.5 text-sm font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Nama Panggilan
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Budi"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isGoogleLoading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-base transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500">Atau lanjut dengan</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending || isGoogleLoading}
          className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-semibold text-sm transition flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
