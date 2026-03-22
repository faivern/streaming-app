import { motion } from "framer-motion";
import BaseInsightCard from "./BaseInsightCard";
import { getGenreColor } from "../../../lib/insights/genreColors";
import type { GenreDistribution } from "../../../types/insights";

const GENRE_PERSONAS: Record<string, string> = {
  Action: "🔥 an adrenaline junkie",
  Adventure: "🧭 an explorer at heart",
  Animation: "✨ forever young",
  Comedy: "😂 the funniest one in the room",
  Crime: "🔍 a crime scene investigator",
  Documentary: "🧠 a curious mind",
  Drama: "🎭 emotionally invested",
  Family: "🏠 a family person",
  Fantasy: "🌌 a world-builder",
  History: "⏳ a time traveller",
  Horror: "🌙 a creature of the night",
  Music: "🎵 always on beat",
  Mystery: "🧩 a puzzle solver",
  Romance: "💕 hopelessly romantic",
  "Science Fiction": "🚀 reaching for the stars",
  "Sci-Fi & Fantasy": "🚀 reaching for the stars",
  Thriller: "⚡ living on the edge",
  War: "🎖️ a witness to history",
  Western: "🤠 a lone rider",
  Anime: "⛩️ a true otaku",
};

type TopGenresCardProps = {
  genres: GenreDistribution[];
};

export default function TopGenresCard({ genres }: TopGenresCardProps) {
  const topGenre = genres[0];
  const persona = topGenre
    ? (GENRE_PERSONAS[topGenre.name] ?? "🎬 a cinematic explorer")
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
        <p className="text-base mb-4">
          <span className="text-subtle">You're </span>
          <span className="font-semibold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            {persona}
          </span>
        </p>
      )}
      <div className="space-y-3">
        {genres.map((genre, index) => {
          const color = getGenreColor(genre.name, index);
          const pct = (genre.value / maxValue) * 100;
          return (
            <div
              key={genre.name}
              className="flex items-center gap-3 hover:bg-accent-primary/5 rounded-lg transition-colors px-2 -mx-2 py-0.5"
            >
              {/* Genre-colored left accent bar */}
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="text-sm font-medium w-5 text-subtle text-center">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-text-h1">{genre.name}</span>
                  <span className="text-sm text-subtle">{genre.value}</span>
                </div>
                <div className="h-2 bg-component-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: "easeOut",
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
