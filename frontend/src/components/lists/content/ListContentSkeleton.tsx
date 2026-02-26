type ListContentSkeletonProps = {
  viewMode: "grid" | "list";
};

export default function ListContentSkeleton({
  viewMode,
}: ListContentSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl bg-component-primary/50"
          >
            <div className="w-16 h-24 bg-border rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-border rounded animate-pulse" />
              <div className="h-4 w-24 bg-border rounded animate-pulse" />
              <div className="h-4 w-32 bg-border rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] bg-component-primary rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
