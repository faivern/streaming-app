export default function MediaCardSkeleton() {
  return (
    <div className="relative w-full mx-auto">
      <div
        className="bg-[var(--component-primary)] rounded-2xl border border-[var(--border)]
          overflow-hidden shadow-lg relative"
      >
        {/* Poster skeleton */}
        <div className="aspect-[2/3] w-full bg-border/30 animate-pulse relative overflow-hidden">
          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Rating pill placeholder */}
        <div className="absolute top-2 right-2 h-6 w-14 bg-border/40 rounded-full animate-pulse" />

        {/* Title bar placeholder — mimics the hover gradient overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-6">
          <div className="h-3.5 w-3/5 bg-white/15 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
