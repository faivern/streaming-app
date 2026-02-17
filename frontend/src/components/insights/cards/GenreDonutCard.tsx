import BaseInsightCard from "./BaseInsightCard";
import DonutChart from "../charts/DonutChart";
import type { GenreDistribution } from "../../../types/insights";

type GenreDonutCardProps = {
  data: GenreDistribution[];
};

export default function GenreDonutCard({ data }: GenreDonutCardProps) {
  // Transform to chart format
  const chartData = data.map((genre) => ({
    name: genre.name,
    value: genre.value,
  }));

  return (
    <BaseInsightCard title="Genre Distribution" span="md:col-span-2 md:row-span-2">
      {chartData.length > 0 ? (
        <DonutChart data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-64 text-subtle">
          No genre data available
        </div>
      )}
    </BaseInsightCard>
  );
}
