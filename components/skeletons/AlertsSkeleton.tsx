export default function AlertsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-emerald-500/10 rounded-lg w-48 shimmer" />
        <div className="h-10 bg-emerald-500/10 rounded-lg w-40 shimmer" />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-emerald-500/10 rounded w-32 shimmer" />
                <div className="h-4 bg-emerald-500/10 rounded w-24 shimmer" />
              </div>
              <div className="h-6 bg-emerald-500/10 rounded-full w-16 shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-emerald-500/10 rounded w-full shimmer" />
              <div className="h-3 bg-emerald-500/10 rounded w-3/4 shimmer" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-emerald-500/10 rounded w-20 shimmer" />
              <div className="h-8 bg-emerald-500/10 rounded w-20 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
