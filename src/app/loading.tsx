export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto px-4 pt-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-zinc-800 rounded"></div>
          <div className="h-6 w-40 bg-zinc-800 rounded"></div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-zinc-800"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
        <div className="h-20 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
      </div>

      {/* Main Banner Skeleton */}
      <div className="h-36 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>

      {/* List Section Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-zinc-800 rounded"></div>
        <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
        <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl"></div>
      </div>
    </div>
  );
}
