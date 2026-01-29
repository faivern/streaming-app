import { useMemo } from "react";
import { useGenres } from "../../../hooks/genres/useGenres";
import type { DiscoverMediaType } from "../../../hooks/discover/useDiscoverFilters";

type Props = {
  mediaType: DiscoverMediaType;
  selectedGenreIds: number[];
  onToggleGenre: (genreId: number) => void;
};

export default function GenreCheckboxList({
  mediaType,
  selectedGenreIds,
  onToggleGenre,
}: Props) {
  const { data: genres = [], isLoading } = useGenres();

  const filteredGenres = useMemo(() => {
    // For "both", show all genres; otherwise filter by media type
    if (mediaType === "both") {
      return genres.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return genres
      .filter((genre) => genre.supportedMediaTypes.includes(mediaType))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [genres, mediaType]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-5 bg-gray-700/50 rounded animate-pulse"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
      {filteredGenres.map((genre) => {
        const isSelected = selectedGenreIds.includes(genre.id);
        return (
          <label
            key={genre.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
              isSelected
                ? "bg-accent-primary/20 text-white"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleGenre(genre.id)}
              className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-accent-primary focus:ring-accent-primary/50 focus:ring-offset-0"
            />
            <span className="text-sm">{genre.name}</span>
          </label>
        );
      })}
    </div>
  );
}
