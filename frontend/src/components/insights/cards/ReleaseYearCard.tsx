import BaseInsightCard from "./BaseInsightCard";
import BarChart from "../charts/BarChart";
import type { ReleaseYearBreakdown } from "../../../types/insights";

type ReleaseYearCardProps = {
  data: ReleaseYearBreakdown[];
};

export default function ReleaseYearCard({ data }: ReleaseYearCardProps) {
  const decadeMap = new Map<string, number>();

  data.forEach((item) => {
    const current = decadeMap.get(item.decade) || 0;
    decadeMap.set(item.decade, current + item.count);
  });

  const chartData = Array.from(decadeMap.entries())
    .map(([decade, count]) => ({ label: decade, value: count }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));

  const peakDecade = chartData.reduce<{ label: string; value: number; index: number } | null>(
    (best, d, i) => (!best || d.value > best.value ? { ...d, index: i } : best),
    null
  );

  return (
    <BaseInsightCard title="Release Decades">
      {chartData.length > 0 ? (
        <>
          {peakDecade && (
            <p className="text-sm text-subtle mb-3">
              You gravitate toward{" "}
              <span className="font-semibold text-accent-primary drop-shadow-[0_0_4px_var(--accent-primary)]">
                {peakDecade.label}
              </span>{" "}
              cinema
            </p>
          )}
          <BarChart
            data={chartData}
            highlightIndex={peakDecade?.index}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-subtle">
          No release data available
        </div>
      )}
    </BaseInsightCard>
  );
}
