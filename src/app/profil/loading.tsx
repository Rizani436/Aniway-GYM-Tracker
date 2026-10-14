export default function ProfilLoading() {
  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] max-w-md mx-auto px-4 pt-[max(1.5rem,env(safe-area-inset-top))] space-y-5">
      {/* Kartu identitas user */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-white/[0.08] rounded" />
          <div className="h-3 w-44 bg-white/[0.05] rounded" />
        </div>
      </div>

      {/* Baris info */}
      <div className="space-y-2 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-24 bg-white/[0.06] rounded" />
                <div className="h-4 w-36 bg-white/[0.07] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol keluar */}
      <div className="h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-pulse" />
    </div>
  );
}
