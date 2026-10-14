'use client';

import { useEffect, useState } from 'react';
import { Timer, X, Volume2, VolumeX, Plus, Minus } from 'lucide-react';
import { playRestCompleteAlarm, playBeep } from '@/lib/audio-timer';

interface WorkoutTimerBarProps {
  initialSeconds: number;
  onFinish?: () => void;
  onClose: () => void;
}

export function WorkoutTimerBar({ initialSeconds, onFinish, onClose }: WorkoutTimerBarProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (isSoundEnabled) {
        playRestCompleteAlarm();
      }
      onFinish?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isSoundEnabled) {
            playRestCompleteAlarm();
          }
          onFinish?.();
          return 0;
        }
        // Beep tipis di 3 detik terakhir
        if (prev <= 4 && prev > 1 && isSoundEnabled) {
          playBeep(660, 80);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, isSoundEnabled, onFinish]);

  const addTime = (secs: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + secs));
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + secs));
  };

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-3 pb-[env(safe-area-inset-bottom,12px)] pointer-events-none">
      <div className="pointer-events-auto bg-[#0f1011]/95 backdrop-blur-xl border border-emerald-500/35 shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-2xl p-3 space-y-2 text-zinc-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Timer className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono tracking-tight text-white leading-none">
                  {formattedTime}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Istirahat
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Napas & siapkan set berikutnya</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => addTime(-15)}
              className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-0.5 active:scale-95 transition-all"
              title="-15 detik"
            >
              <Minus className="w-3 h-3" />
              15s
            </button>
            <button
              type="button"
              onClick={() => addTime(30)}
              className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-0.5 active:scale-95 transition-all"
              title="+30 detik"
            >
              <Plus className="w-3 h-3" />
              30s
            </button>
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-white active:scale-95 transition-all"
              title={isSoundEnabled ? 'Suara aktif' : 'Suara bisu'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-rose-400 active:scale-95 transition-all"
              title="Tutup Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
