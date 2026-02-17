import BaseInsightCard from "./BaseInsightCard";
import BarChart from "../charts/BarChart";
import type { ReleaseYearBreakdown } from "../../../types/insights";

type ReleaseYearCardProps = {
  data: ReleaseYearBreakdown[];
};

export default function ReleaseYearCard({ data }: ReleaseYearCardProps) {
  // Group by decade and aggregate counts
  const decadeMap = new Map<string, number>();

  data.forEach((item) => {
    const current = decadeMap.get(item.decade) || 0;
    decadeMap.set(item.decade, current + item.count);
  });

  // Convert to chart format and sort by decade
  const chartData = Array.from(decadeMap.entries())
    .map(([decade, count]) => ({
      label: decade,
      value: count,
    }))
    .sort((a, b) => {
      // Extract decade start year (e.g., "2020s" -> 2020)
      const yearA = parseInt(a.label);
      const yearB = parseInt(b.label);
      return yearA - yearB;
    });

  return (
    <BaseInsightCard title="Release Decades" span="md:col-span-2 lg:col-span-3">
      {chartData.length > 0 ? (
        <BarChart data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-64 text-subtle">
          No release data available
        </div>
      )}
    </BaseInsightCard>
  );
}
