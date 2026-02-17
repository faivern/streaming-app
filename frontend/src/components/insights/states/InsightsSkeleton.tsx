export default function InsightsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-6">
      {/* HeroStatCard skeleton */}
      <div className="md:col-span-2 md:row-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-64" />

      {/* GenreDonutCard skeleton */}
      <div className="md:col-span-2 md:row-span-2 lg:col-span-4 animate-pulse bg-component-primary/40 rounded-2xl h-64" />

      {/* TopPeopleCard skeleton */}
      <div className="md:col-span-2 lg:col-span-3 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* TopGenresCard skeleton */}
      <div className="md:col-span-2 lg:col-span-3 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* RatingComparisonCard skeleton */}
      <div className="md:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* ActiveMonthCard skeleton */}
      <div className="md:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />

      {/* ReleaseYearCard skeleton */}
      <div className="md:col-span-4 lg:col-span-2 animate-pulse bg-component-primary/40 rounded-2xl h-48" />
    </div>
  );
}
