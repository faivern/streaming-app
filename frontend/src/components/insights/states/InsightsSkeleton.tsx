const card =
  "bg-component-primary/60 backdrop-blur-md border border-border/40 rounded-2xl p-6 shadow-xl animate-pulse";
const s = "bg-border/40 rounded";

export default function InsightsSkeleton() {
  return (
    <>
      {/* IdentityIntroCard skeleton */}
      <div className={`${card} mb-8`}>
        <div className={`h-2.5 w-32 ${s} mb-5`} />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`aspect-[2/3] rounded-2xl ${s}`} />
          ))}
        </div>
      </div>

    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-6">

      {/* HeroStatCard */}
      <div className={`${card} md:col-span-2 md:row-span-2 h-64`}>
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className={`w-9 h-9 rounded-full ${s} mb-2`} />
          <div className={`h-3 w-24 ${s}`} />
          <div className={`h-16 w-20 rounded-lg ${s} mt-1`} />
          <div className={`h-4 w-28 ${s}`} />
          <div className="mt-4 pt-3 border-t border-border/30 w-full flex justify-center">
            <div className={`h-3 w-40 ${s}`} />
          </div>
        </div>
      </div>

      {/* GenreDonutCard */}
      <div className={`${card} md:col-span-2 md:row-span-2 lg:col-span-4 h-64`}>
        <div className={`h-3 w-16 ${s} mb-3`} />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-border/40 flex-shrink-0" />
          <div className={`h-3 w-36 ${s}`} />
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-36 h-36">
            <div className="w-full h-full rounded-full bg-border/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-component-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* TopPeopleCard */}
      <div className={`${card} md:col-span-2 lg:col-span-3 h-48`}>
        <div className={`h-3 w-24 ${s} mb-1`} />
        <div className={`h-3 w-44 ${s} mb-4`} />
        <div>
          <div className={`h-2.5 w-12 ${s} mb-2`} />
          <div className="space-y-0.5">
            {[28, 24, 20].map((w, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-border/40 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className={`h-3 ${s}`} style={{ width: `${w * 3}px` }} />
                  <div className={`h-2 w-16 ${s}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TopGenresCard */}
      <div className={`${card} md:col-span-2 lg:col-span-3 h-48`}>
        <div className={`h-3 w-20 ${s} mb-1`} />
        <div className={`h-3 w-44 ${s} mb-4`} />
        <div className="space-y-2">
          {[60, 50, 40, 32, 24].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-4 ${s}`} />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center mb-0.5">
                  <div className={`h-3 ${s}`} style={{ width: `${w}%` }} />
                  <div className={`h-3 w-5 ${s}`} />
                </div>
                <div className="h-2 w-full bg-border/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RatingComparisonCard */}
      <div className={`${card} md:col-span-2 h-48`}>
        <div className={`h-3 w-36 ${s} mb-3`} />
        <div className="flex items-center justify-around gap-4 py-2">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`h-3 w-8 ${s}`} />
            <div className={`h-10 w-14 rounded-lg ${s}`} />
          </div>
          <div className="w-7 h-7 rounded-full bg-border/40" />
          <div className="flex flex-col items-center gap-1.5">
            <div className={`h-3 w-12 ${s}`} />
            <div className={`h-10 w-14 rounded-lg ${s}`} />
          </div>
        </div>
        <div className="border-t border-border/30 pt-3 flex flex-col items-center gap-1.5">
          <div className={`h-3 w-24 ${s}`} />
          <div className={`h-2.5 w-40 ${s}`} />
          <div className={`h-2.5 w-28 ${s}`} />
        </div>
      </div>

      {/* ActiveMonthCard */}
      <div className={`${card} md:col-span-2 h-48`}>
        <div className={`h-3 w-32 ${s} mb-3`} />
        <div className="flex items-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-border/40 flex-shrink-0" />
          <div className="space-y-2">
            <div className={`h-7 w-28 rounded-lg ${s}`} />
            <div className={`h-3 w-20 ${s}`} />
          </div>
        </div>
        <div className="border-t border-border/30 pt-2 flex justify-center">
          <div className={`h-3 w-44 ${s}`} />
        </div>
      </div>

      {/* ReleaseYearCard */}
      <div className={`${card} md:col-span-4 lg:col-span-2 h-48`}>
        <div className={`h-3 w-24 ${s} mb-1`} />
        <div className={`h-3 w-44 ${s} mb-4`} />
        <div className="flex items-end gap-2 h-20 px-1">
          {[35, 55, 70, 90, 60, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-border/40 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-2 w-7 ${s}`} />
          ))}
        </div>
      </div>

    </div>
    </>
  );
}
