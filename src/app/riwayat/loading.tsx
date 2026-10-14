export default function RiwayatLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto px-4 pt-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-40 bg-zinc-800 rounded"></div>
          <div className="h-3 w-48 bg-zinc-850 rounded"></div>
        </div>
        <div className="h-9 w-28 bg-zinc-800 rounded-xl"></div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-4 gap-2">
        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl"></div>
        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl"></div>
        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl"></div>
        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl"></div>
      </div>

      {/* Heatmap skeleton */}
      <div className="h-36 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>

      {/* History item skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-zinc-800 rounded"></div>
        <div className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
        <div className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
      </div>
    </div>
  );
}
