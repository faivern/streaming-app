export default function MediaCardSkeleton() {
  return (
    <div className="relative w-full mx-auto animate-pulse">
      <div className="bg-card rounded-xl border border-border/30 overflow-hidden shadow-md">
        {/* Poster skeleton */}
        <div className="aspect-[2/3] w-full bg-border/40" />
        {/* Rating skeleton */}
        <div className="absolute top-2 right-2 h-7 w-16 bg-border/60 rounded-full" />
      </div>
    </div>
  );
}
