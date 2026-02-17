export default function InsightsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-6">
      {/* Hero stat card skeleton - large */}
      <div className="md:col-span-2 md:row-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-64" />

      {/* Genre donut card skeleton - large */}
      <div className="md:col-span-2 md:row-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-64" />

      {/* Top people card skeleton - large */}
      <div className="md:col-span-2 md:row-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-64" />

      {/* Top genres card skeleton */}
      <div className="md:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* Rating comparison card skeleton */}
      <div className="md:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* Active month card skeleton */}
      <div className="md:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* Release year card skeleton */}
      <div className="md:col-span-2 lg:col-span-3 animate-pulse bg-component-primary/40 rounded-2xl h-64" />
    </div>
  );
}
