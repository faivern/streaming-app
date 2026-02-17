import BaseInsightCard from "./BaseInsightCard";
import type { GenreDistribution } from "../../../types/insights";

type TopGenresCardProps = {
  genres: GenreDistribution[];
};

export default function TopGenresCard({ genres }: TopGenresCardProps) {
  if (genres.length === 0) {
    return (
      <BaseInsightCard title="Top Genres" span="md:col-span-2">
        <div className="flex items-center justify-center h-32 text-subtle">
          No genre data available
        </div>
      </BaseInsightCard>
    );
  }

  // Calculate max value for percentage bars
  const maxValue = genres[0]?.value || 1;

  return (
    <BaseInsightCard title="Top Genres" span="md:col-span-2">
      <div className="space-y-3">
        {genres.map((genre, index) => (
          <div key={genre.name} className="flex items-center gap-3">
            <div className="text-accent-primary font-bold text-lg w-6">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-text-h1">{genre.name}</span>
                <span className="text-sm text-subtle">{genre.value}</span>
              </div>
              <div className="h-2 bg-component-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary rounded-full transition-all duration-500"
                  style={{ width: `${(genre.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseInsightCard>
  );
}
