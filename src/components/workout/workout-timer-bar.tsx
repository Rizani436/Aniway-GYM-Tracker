'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const soundRef = useRef(isSoundEnabled);
  soundRef.current = isSoundEnabled;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Timer tunggal berbasis deadline — akurat meski tab di-background browser mobile
  useEffect(() => {
    const deadline = Date.now() + initialSeconds * 1000;
    setTotalSeconds(initialSeconds);
    setSecondsLeft(initialSeconds);

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);

      const secsToGo = deadline - Date.now();
      if (secsToGo <= 4000 && secsToGo > 1000 && soundRef.current) {
        playBeep(660, 80);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (soundRef.current) {
          playRestCompleteAlarm();
        }
        onFinishRef.current?.();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [initialSeconds]);

  const addTime = useCallback((secs: number) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + secs);
      setTotalSeconds((t) => Math.max(t, next));
      return next;
    });
  }, []);

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div
        className={`pointer-events-auto rounded-2xl p-3 space-y-2.5 text-zinc-100 border shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-colors duration-300 ${
          isUrgent
            ? 'bg-rose-950/90 border-rose-500/50'
            : 'bg-[#0f1011]/95 border-emerald-500/35'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isUrgent
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <Timer className={`w-5 h-5 ${isUrgent ? 'animate-ping' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black font-mono tracking-tight leading-none tabular-nums ${
                    isUrgent ? 'text-rose-200' : 'text-white'
                  }`}
                >
                  {formattedTime}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isUrgent ? 'text-rose-300' : 'text-emerald-400'
                  }`}
                >
                  Istirahat
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                {isUrgent ? 'Siap-siap set berikutnya!' : 'Napas & siapkan set berikutnya'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => addTime(-15)}
              className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[11px] font-bold flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
              title="-15 detik"
              aria-label="Kurangi 15 detik"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => addTime(15)}
              className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[11px] font-bold flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
              title="+15 detik"
              aria-label="Tambah 15 detik"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
              title={isSoundEnabled ? 'Suara aktif' : 'Suara bisu'}
              aria-label={isSoundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
              title="Tutup timer"
              aria-label="Tutup timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-250 ease-linear rounded-full ${
              isUrgent
                ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
