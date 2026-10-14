'use client';

import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

interface ActivityHeatmapProps {
  data: Array<{
    date: string; // YYYY-MM-DD
    count: number;
    volume: number;
  }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    count: number;
    volume: number;
  } | null>(null);

  // Generate 16 minggu terakhir (112 hari)
  const days = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 111); // 16 weeks * 7 = 112 days
    return eachDayOfInterval({ start: startDate, end: today });
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, { count: number; volume: number }>();
    data.forEach((d) => {
      map.set(d.date, { count: d.count, volume: d.volume });
    });
    return map;
  }, [data]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-white/[0.04] border-white/[0.05]';
    if (count === 1) return 'bg-emerald-600/60 border-emerald-500/40';
    if (count === 2) return 'bg-emerald-500 border-emerald-400';
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Kalender Aktivitas
        </h3>
        {hoveredDay ? (
          <p className="text-xs text-zinc-200 font-medium">
            <span className="text-emerald-400 font-bold">{hoveredDay.dateStr}</span>:{' '}
            {hoveredDay.count > 0 ? (
              <>
                {hoveredDay.count} sesi ({hoveredDay.volume.toLocaleString('id-ID')} kg)
              </>
            ) : (
              'Istirahat'
            )}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-500">Sentuh kotak untuk detail</p>
        )}
      </div>

      {/* Grid Heatmap */}
      <div className="overflow-x-auto pb-1 no-scrollbar">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = dataMap.get(dateKey) || { count: 0, volume: 0 };
            const formattedDisplay = format(day, 'd MMMM yyyy', { locale: id });

            return (
              <div
                key={dateKey}
                onMouseEnter={() =>
                  setHoveredDay({
                    dateStr: formattedDisplay,
                    count: dayData.count,
                    volume: dayData.volume,
                  })
                }
                onClick={() =>
                  setHoveredDay({
                    dateStr: formattedDisplay,
                    count: dayData.count,
                    volume: dayData.volume,
                  })
                }
                className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer hover:scale-125 ${getColorClass(
                  dayData.count
                )}`}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-white/[0.06]">
        <span>Istirahat</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04] border border-white/[0.05]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
        </div>
        <span>Aktif</span>
      </div>
    </div>
  );
}
