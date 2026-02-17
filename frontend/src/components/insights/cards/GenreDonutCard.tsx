import BaseInsightCard from "./BaseInsightCard";
import DonutChart from "../charts/DonutChart";
import { getGenreColor } from "../../../lib/insights/genreColors";
import type { GenreDistribution } from "../../../types/insights";

type GenreDonutCardProps = {
  data: GenreDistribution[];
};

export default function GenreDonutCard({ data }: GenreDonutCardProps) {
  const chartData = data.map((genre) => ({ name: genre.name, value: genre.value }));
  const colors = chartData.map((d, i) => getGenreColor(d.name, i));
  const topGenre = data[0];
  const topColor = topGenre ? getGenreColor(topGenre.name, 0) : undefined;

  return (
    <BaseInsightCard title="Genre DNA">
      {chartData.length > 0 ? (
        <>
          {topGenre && (
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: topColor }}
              />
              <span className="text-sm text-subtle">
                Mostly{" "}
                <span className="font-semibold text-text-h1">{topGenre.name}</span>
                {" "}— {topGenre.value} titles
              </span>
            </div>
          )}
          <DonutChart data={chartData} colors={colors} />
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-subtle">
          No genre data available
        </div>
      )}
    </BaseInsightCard>
  );
}
