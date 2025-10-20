export default function PricesSkeleton() {
  return (
    <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-emerald-500/10 rounded w-40 shimmer" />
        <div className="h-8 bg-emerald-500/10 rounded w-24 shimmer" />
      </div>

      {/* Price cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 bg-emerald-500/10 rounded w-16 shimmer" />
              <div className="h-4 bg-emerald-500/10 rounded w-12 shimmer" />
            </div>
            <div className="h-8 bg-emerald-500/10 rounded w-24 mb-2 shimmer" />
            <div className="h-3 bg-emerald-500/10 rounded w-20 shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
