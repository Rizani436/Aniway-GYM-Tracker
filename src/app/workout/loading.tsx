export default function WorkoutLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto px-4 pt-4 space-y-4 animate-pulse">
      {/* Workout header skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="h-6 w-36 bg-zinc-800 rounded"></div>
          <div className="h-3 w-24 bg-zinc-850 rounded"></div>
        </div>
        <div className="h-10 w-24 bg-zinc-800 rounded-xl"></div>
      </div>

      {/* Exercise card skeleton */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-zinc-800 rounded"></div>
          <div className="h-6 w-16 bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-12 bg-zinc-950 rounded-xl"></div>
        <div className="h-12 bg-zinc-950 rounded-xl"></div>
        <div className="h-12 bg-zinc-950 rounded-xl"></div>
      </div>

      {/* Bottom action skeleton */}
      <div className="h-12 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl"></div>
    </div>
  );
}
