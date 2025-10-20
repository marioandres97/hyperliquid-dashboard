export default function OrdersFeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-emerald-500/10 rounded-lg w-48 shimmer" />
        <div className="flex gap-2">
          <div className="h-10 bg-emerald-500/10 rounded-lg w-24 shimmer" />
          <div className="h-10 bg-emerald-500/10 rounded-lg w-24 shimmer" />
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-4 pb-4 border-b border-emerald-500/10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-emerald-500/10 rounded w-20 shimmer" />
        ))}
      </div>

      {/* Order rows */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 py-4 border-b border-emerald-500/10"
        >
          <div className="h-4 bg-emerald-500/10 rounded w-16 shimmer" />
          <div className="h-4 bg-emerald-500/10 rounded w-24 shimmer" />
          <div className="h-4 bg-emerald-500/10 rounded w-20 shimmer" />
          <div className="h-4 bg-emerald-500/10 rounded w-full shimmer" />
          <div className="h-6 bg-emerald-500/10 rounded-full w-16 shimmer" />
        </div>
      ))}
    </div>
  );
}
