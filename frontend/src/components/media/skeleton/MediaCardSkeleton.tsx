export default function MediaCardSkeleton() {
  return (
    <div className="relative w-full mx-auto animate-pulse">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl border border-gray-700/30 overflow-hidden shadow-md">
        {/* Poster skeleton */}
        <div className="aspect-[2/3] w-full bg-gray-700/40" />
        {/* Rating skeleton */}
        <div className="absolute top-2 right-2 h-7 w-16 bg-gray-700/60 rounded-full" />
      </div>
    </div>
  );
}
