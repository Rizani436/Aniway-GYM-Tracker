export default function PersonalRecordsLoading() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] pb-28 max-w-md mx-auto px-4 pt-6 space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-zinc-800 rounded-xl"></div>
        <div className="h-6 w-28 bg-zinc-800 rounded"></div>
      </div>

      {/* PR card skeletons */}
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-3.5 space-y-2"
          >
            <div className="h-4 w-40 bg-zinc-800 rounded"></div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-zinc-800 rounded"></div>
              <div className="h-3 w-16 bg-zinc-800 rounded"></div>
            </div>
            <div className="h-2.5 w-20 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
