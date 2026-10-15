'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import type { BodyWeightData } from '@/app/actions/statistik-actions';
import { logBodyWeightAction } from '@/app/actions/statistik-actions';

export function BodyWeightCard({ data }: { data: BodyWeightData }) {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = data.logs.map((l) => ({
    ...l,
    label: format(new Date(l.recordedAt), 'd/M'),
  }));

  async function handleLog() {
    if (!weight || saving) return;
    setSaving(true);
    setError(null);
    try {
      await logBodyWeightAction(Number(weight));
      setWeight('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mencatat berat badan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
        <Scale className="w-4 h-4 text-emerald-400" />
        <span>Berat Badan</span>
      </div>

      {data.latest != null && (
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tabular-nums text-white">
            {data.latest}
          </span>
          <span className="text-xs text-zinc-400">kg</span>
          {data.trend7d != null && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold tabular-nums text-zinc-400">
              <TrendingUp className="w-3 h-3" />
              {(data.trend7d >= 0 ? '+' : '') + data.trend7d.toFixed(1) + ' kg / 7hr'}
            </span>
          )}
        </div>
      )}

      {chartData.length < 2 ? (
        <p className="text-xs text-zinc-400 text-center py-6">
          Catat berat badan minimal 2x untuk melihat grafik.
        </p>
      ) : (
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} minTickGap={24} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#0f1011',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Berat']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2}
                dot={chartData.length < 30 ? { r: 2.5, fill: '#10b981' } : false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="Berat hari ini"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 min-w-0 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm tabular-nums text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="button"
          onClick={handleLog}
          disabled={!weight || saving}
          className="px-4 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs disabled:opacity-40 disabled:hover:bg-emerald-500/15 active:scale-95 transition-all"
        >
          {saving ? '...' : 'Catat'}
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-400 mt-1.5">{error}</p>}
    </div>
  );
}
