export default function LatihanLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg-strong)] max-w-md mx-auto px-4 pt-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-36 bg-[var(--surface-2)] rounded"></div>
          <div className="h-3 w-48 bg-[var(--surface-2)] rounded"></div>
        </div>
        <div className="h-9 w-24 bg-[var(--surface-2)] rounded-xl"></div>
      </div>

      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl"></div>
        <div className="h-9 flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl"></div>
      </div>

      <div className="space-y-3">
        <div className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"></div>
        <div className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"></div>
        <div className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"></div>
      </div>
    </div>
  );
}
