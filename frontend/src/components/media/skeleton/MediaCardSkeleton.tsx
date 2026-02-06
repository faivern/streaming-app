export default function MediaCardSkeleton() {
  return (
    <div className="relative w-full mx-auto animate-pulse">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl border border-gray-700/30 overflow-hidden shadow-md">
        {/* Poster skeleton */}
        <div className="aspect-[2/3] w-full bg-gray-700/40" />
        {/* Content skeleton */}
        <div className="p-4">
          <div className="h-4 bg-gray-700/60 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700/40 rounded w-1/2" />
        </div>
        {/* Rating skeleton */}
        <div className="absolute top-2 right-2 h-7 w-16 bg-gray-700/60 rounded-full" />
      </div>
    </div>
  );
}
