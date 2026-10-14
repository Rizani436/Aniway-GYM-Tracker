export default function WorkoutLoading() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] max-w-lg mx-auto px-4 pt-4 space-y-4">
      {/* Workout header skeleton */}
      <div className="flex items-center justify-between gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-white/[0.08] animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-36 bg-white/[0.06] rounded" />
          <div className="h-3 w-24 bg-white/[0.04] rounded" />
        </div>
        <div className="h-10 w-24 bg-emerald-500/20 rounded-xl" />
      </div>

      {/* Exercise card skeleton */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-3 animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-white/[0.06] rounded" />
              <div className="h-3 w-28 bg-white/[0.04] rounded" />
            </div>
            <div className="h-8 w-8 bg-white/[0.05] rounded-lg" />
          </div>
          {[0, 1, 2].map((j) => (
            <div key={j} className="flex gap-1.5">
              <div className="w-8 h-9 bg-white/[0.05] rounded-lg" />
              <div className="flex-1 h-9 bg-white/[0.04] rounded-lg" />
              <div className="flex-1 h-9 bg-white/[0.04] rounded-lg" />
              <div className="w-9 h-9 bg-white/[0.05] rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
