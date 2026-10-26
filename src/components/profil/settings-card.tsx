'use client';

import { useState, useTransition } from 'react';
import { WeightUnit, ThemeMode } from '@prisma/client';
import { Loader2, Check, Timer, Scale, Moon, Sun } from 'lucide-react';
import { updateUserSettingsAction } from '@/app/actions/user-actions';

const REST_PRESETS = [30, 45, 60, 90, 120, 180];

interface SettingsCardProps {
  initialWeightUnit: WeightUnit;
  initialRestTimer: number;
  initialTheme: ThemeMode;
}

export function SettingsCard({
  initialWeightUnit,
  initialRestTimer,
  initialTheme,
}: SettingsCardProps) {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initialWeightUnit);
  const [restTimer, setRestTimer] = useState<number>(initialRestTimer);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty =
    weightUnit !== initialWeightUnit ||
    restTimer !== initialRestTimer ||
    theme !== initialTheme;

  const applyThemeClass = (mode: ThemeMode) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', mode === ThemeMode.DARK);
    }
  };

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      try {
        await updateUserSettingsAction({
          weightUnit,
          defaultRestTimer: restTimer,
          theme,
        });
        applyThemeClass(theme);
        setSaved(true);
        // Reset penanda "tersimpan" setelah 2 detik
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        alert((e as Error)?.message || 'Gagal menyimpan pengaturan.');
      }
    });
  };

  return (
    <section className="p-4 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
          <Scale className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-[var(--fg)]">Pengaturan Latihan</h2>
          <p className="text-[11px] text-[var(--muted)]">Satuan, istirahat default, dan tampilan</p>
        </div>
      </div>

      {/* Satuan berat */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
          Satuan Berat
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <button
            type="button"
            onClick={() => setWeightUnit(WeightUnit.KG)}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              weightUnit === WeightUnit.KG
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Kilogram (kg)
          </button>
          <button
            type="button"
            onClick={() => setWeightUnit(WeightUnit.LB)}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              weightUnit === WeightUnit.LB
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Pound (lb)
          </button>
        </div>
      </div>

      {/* Timer istirahat default */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
          <span className="inline-flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            Istirahat Default
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {REST_PRESETS.map((detik) => (
            <button
              key={detik}
              type="button"
              onClick={() => setRestTimer(detik)}
              className={`h-8 px-3 rounded-lg text-xs font-bold font-mono tabular-nums transition-colors ${
                restTimer === detik
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[var(--card-hover)] text-[var(--muted)] border border-transparent active:bg-[var(--card-hover)]'
              }`}
            >
              {detik}s
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={10}
              max={600}
              step={5}
              value={restTimer}
              onChange={(e) => {
                const v = Math.max(10, Math.min(600, Math.round(Number(e.target.value) || 90)));
                setRestTimer(v);
              }}
              className="w-20 h-8 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] px-2.5 text-center text-xs font-mono text-[var(--fg)] focus:outline-none focus:border-emerald-500"
              aria-label="Durasi istirahat custom dalam detik"
            />
            <span className="text-xs text-[var(--muted-strong)]">detik</span>
          </div>
        </div>
      </div>

      {/* Tema */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
          Tema Tampilan
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <button
            type="button"
            onClick={() => setTheme(ThemeMode.DARK)}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              theme === ThemeMode.DARK
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Gelap
          </button>
          <button
            type="button"
            onClick={() => setTheme(ThemeMode.LIGHT)}
            className={`py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              theme === ThemeMode.LIGHT
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Terang
          </button>
        </div>
      </div>

      {/* Simpan */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !dirty}
        className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Menyimpan...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Tersimpan
          </>
        ) : (
          'Simpan Pengaturan'
        )}
      </button>
    </section>
  );
}
