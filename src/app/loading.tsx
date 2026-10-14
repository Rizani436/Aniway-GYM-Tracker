export default function Loading() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] max-w-md mx-auto px-4 pt-[max(1.5rem,env(safe-area-inset-top))] space-y-5">
      {/* Header: sapaan + tombol keluar */}
      <div className="flex items-center justify-between pt-1 animate-pulse">
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-white/[0.06] rounded" />
          <div className="h-6 w-40 bg-white/[0.08] rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
      </div>

      {/* Dua kartu ringkasan */}
      <div className="grid grid-cols-2 gap-2.5 animate-pulse">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-5 w-8 bg-white/[0.08] rounded" />
              <div className="h-3 w-20 bg-white/[0.05] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Hero card sesi baru */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-emerald-500/20 space-y-3.5 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-32 bg-white/[0.07] rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/[0.05] rounded" />
          <div className="h-3 w-4/5 bg-white/[0.05] rounded" />
        </div>
        <div className="flex gap-2 pt-0.5">
          <div className="h-11 flex-1 bg-emerald-500/20 rounded-xl" />
          <div className="h-11 w-24 bg-white/[0.05] rounded-xl" />
        </div>
      </div>

      {/* Daftar program */}
      <div className="space-y-3 animate-pulse">
        <div className="flex items-center justify-between px-0.5">
          <div className="h-3 w-32 bg-white/[0.06] rounded" />
          <div className="h-3 w-14 bg-white/[0.05] rounded" />
        </div>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2.5 h-8 rounded-full bg-white/[0.07] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-white/[0.07] rounded" />
                <div className="h-3 w-24 bg-white/[0.05] rounded" />
              </div>
            </div>
            <div className="h-9 w-20 rounded-xl bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
