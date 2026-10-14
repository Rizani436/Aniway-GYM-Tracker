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
    <div className="fixed bottom-20 left-0 right-0 z-40 max-w-md mx-auto px-4">
      <div className="bg-zinc-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl space-y-2 text-zinc-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Timer className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-400">Istirahat Antar Set</p>
              <p className="text-xl font-black font-mono tracking-tight text-emerald-400">
                {formattedTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => addTime(-15)}
              className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-0.5"
              title="-15 detik"
            >
              <Minus className="w-3 h-3" />
              15s
            </button>
            <button
              type="button"
              onClick={() => addTime(30)}
              className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-0.5"
              title="+30 detik"
            >
              <Plus className="w-3 h-3" />
              30s
            </button>
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              title={isSoundEnabled ? 'Suara aktif' : 'Suara bisu'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400"
              title="Lewati Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
