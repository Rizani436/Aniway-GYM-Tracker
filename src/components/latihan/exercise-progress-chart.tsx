'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProgressPoint } from '@/app/actions/statistik-actions';

export function ExerciseProgressChart({ data }: { data: ProgressPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 text-center">
        Latihan gerakan ini minimal 2 sesi untuk melihat grafik progres.
      </p>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
        Progres 1RM Estimasi
      </h3>
      {/* Tinggi eksplisit wajib — ResponsiveContainer tidak render tanpa parent berukuran */}
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickFormatter={(v: string) => v.slice(5)}
              minTickGap={24}
            />
            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: '#0f1011',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(value) => [`${Number(value).toFixed(1)} kg`, '1RM Estimasi']}
            />
            <Line
              type="monotone"
              dataKey="best1RM"
              stroke="#10b981"
              strokeWidth={2}
              dot={data.length < 30 ? { r: 2.5, fill: '#10b981' } : false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
