export default function PersonalRecordsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-28 max-w-md mx-auto px-4 pt-6 space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[var(--surface-2)] rounded-xl"></div>
        <div className="h-6 w-28 bg-[var(--surface-2)] rounded"></div>
      </div>

      {/* PR card skeletons */}
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3.5 space-y-2"
          >
            <div className="h-4 w-40 bg-[var(--surface-2)] rounded"></div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[var(--surface-2)] rounded"></div>
              <div className="h-3 w-16 bg-[var(--surface-2)] rounded"></div>
            </div>
            <div className="h-2.5 w-20 bg-[var(--surface-2)] rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
