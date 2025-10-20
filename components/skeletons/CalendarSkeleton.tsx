export default function CalendarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-emerald-500/10 rounded-lg w-48 shimmer" />
        <div className="h-10 bg-emerald-500/10 rounded-lg w-32 shimmer" />
      </div>

      {/* Event cards */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 bg-emerald-500/10 rounded w-16 shimmer" />
                <div className="h-6 bg-emerald-500/10 rounded w-32 shimmer" />
              </div>
              <div className="h-4 bg-emerald-500/10 rounded w-3/4 shimmer" />
              <div className="flex gap-2">
                <div className="h-5 bg-emerald-500/10 rounded-full w-20 shimmer" />
                <div className="h-5 bg-emerald-500/10 rounded-full w-24 shimmer" />
              </div>
            </div>
            <div className="h-12 bg-emerald-500/10 rounded-lg w-12 shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
