'use client';

import { useMemo, useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { calculatePlates } from '@/lib/plate-calculator';
import { cn } from '@/lib/utils';

const BAR_WEIGHT = 20;

/**
 * Tombol + bottom sheet kalkulator plat. Self-contained (state internal),
 * cukup render <PlateCalculatorSheet /> di header runner.
 * ponytail: bar fix 20 kg (barbell Olympic standar gym), tambah prop barWeight bila perlu.
 */
export function PlateCalculatorSheet({ className }: { className?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');

  const result = useMemo(() => {
    const total = parseFloat(weight);
    if (isNaN(total) || total <= 0) return { plates: null as number[] | null, error: null as string | null };
    try {
      return { plates: calculatePlates(total, BAR_WEIGHT), error: null };
    } catch (err) {
      return { plates: null, error: (err as Error).message };
    }
  }, [weight]);

  // Gabungkan plat identik: [15,5,1.25] → "15 kg × 1" dst (terberat dulu)
  const counts = useMemo(() => {
    if (!result.plates) return [];
    const map = new Map<number, number>();
    for (const p of result.plates) map.set(p, (map.get(p) || 0) + 1);
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [result.plates]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-90 transition-transform shrink-0 touch-manipulation',
          className
        )}
        aria-label="Kalkulator plat barbell"
        title="Kalkulator plat barbell"
      >
        <Calculator className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-[#0f1011] border-t border-white/[0.08] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Kalkulator Plat
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-zinc-400 active:scale-90 transition-transform"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="plate-weight" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Beban Total (kg)
              </label>
              <input
                id="plate-weight"
                type="number"
                inputMode="decimal"
                min="0"
                step="2.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="mis. 62.5"
                autoFocus
                className="mt-1.5 w-full h-11 px-3 bg-black/40 border border-white/[0.08] rounded-xl text-base font-bold font-mono text-white tabular-nums text-center focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            {result.error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                {result.error}
              </p>
            )}

            {!result.error && result.plates && result.plates.length === 0 && (
              <p className="text-xs text-zinc-400 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
                Lebih ringan dari bar ({BAR_WEIGHT} kg) — pakai bar saja atau bar + plat kecil.
              </p>
            )}

            {counts.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Tiap sisi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {counts.map(([plate, n]) => (
                    <span
                      key={plate}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold font-mono tabular-nums"
                    >
                      {plate} kg × {n}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-zinc-500 font-mono tabular-nums">
                  Bar {BAR_WEIGHT} kg + plat per sisi = {weight} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
