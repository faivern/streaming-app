import BaseInsightCard from "./BaseInsightCard";
import { getGenreColor } from "../../../lib/insights/genreColors";
import type { GenreDistribution } from "../../../types/insights";

const GENRE_PERSONAS: Record<string, string> = {
  Action: "an adrenaline junkie",
  Adventure: "an explorer at heart",
  Animation: "forever young",
  Comedy: "the funniest one in the room",
  Crime: "a crime scene investigator",
  Documentary: "a curious mind",
  Drama: "emotionally invested",
  Family: "a family person",
  Fantasy: "a world-builder",
  History: "a time traveller",
  Horror: "a creature of the night",
  Music: "always on beat",
  Mystery: "a puzzle solver",
  Romance: "hopelessly romantic",
  "Science Fiction": "reaching for the stars",
  "Sci-Fi & Fantasy": "reaching for the stars",
  Thriller: "living on the edge",
  War: "a witness to history",
  Western: "a lone rider",
};

type TopGenresCardProps = {
  genres: GenreDistribution[];
};

export default function TopGenresCard({ genres }: TopGenresCardProps) {
  const topGenre = genres[0];
  const persona = topGenre
    ? (GENRE_PERSONAS[topGenre.name] ?? "a cinematic explorer")
    : null;

  if (genres.length === 0) {
    return (
      <BaseInsightCard title="Top Genres">
        <div className="flex items-center justify-center h-32 text-subtle">
          No genre data available
        </div>
      </BaseInsightCard>
    );
  }

  const maxValue = genres[0]?.value || 1;

  return (
    <BaseInsightCard title="Top Genres">
      {persona && (
        <p className="text-sm text-subtle mb-4">
          You're{" "}
          <span className="font-semibold text-text-h1">{persona}</span>
        </p>
      )}
      <div className="space-y-3">
        {genres.map((genre, index) => {
          const color = getGenreColor(genre.name, index);
          return (
            <div key={genre.name} className="flex items-center gap-3">
              <div className="font-bold text-lg w-6" style={{ color }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-text-h1">{genre.name}</span>
                  <span className="text-sm text-subtle">{genre.value}</span>
                </div>
                <div className="h-2 bg-component-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(genre.value / maxValue) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BaseInsightCard>
  );
}
