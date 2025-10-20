export default function PnLSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6"
          >
            <div className="h-4 bg-emerald-500/10 rounded w-24 mb-3 shimmer" />
            <div className="h-8 bg-emerald-500/10 rounded w-32 mb-2 shimmer" />
            <div className="h-3 bg-emerald-500/10 rounded w-16 shimmer" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
        <div className="h-8 bg-emerald-500/10 rounded w-48 mb-6 shimmer" />
        <div className="h-64 bg-emerald-500/10 rounded-lg shimmer" />
      </div>

      {/* Position list */}
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
        <div className="h-6 bg-emerald-500/10 rounded w-40 mb-4 shimmer" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-emerald-500/10">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-emerald-500/10 rounded w-24 shimmer" />
                <div className="h-3 bg-emerald-500/10 rounded w-32 shimmer" />
              </div>
              <div className="h-6 bg-emerald-500/10 rounded w-20 shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
