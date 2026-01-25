import { Link } from "react-router-dom";
import "../../../style/MediaCard.css";
import { getGenreColor } from "../../../theme/genreColors";
import type { MediaType } from "../../../types/tmdb";

type GenreCardProps = {
  id: number;
  name: string;
  supportedMediaTypes?: MediaType[];
};

const GenreCard = ({ id, name, supportedMediaTypes }: GenreCardProps) => {
  // Use first supported type (movie if available, else tv)
  const defaultMediaType: MediaType =
    supportedMediaTypes?.includes("movie") ? "movie" : "tv";

  return (
    <div
      className={`group relative h-48 rounded-lg overflow-hidden
                 ${getGenreColor(id)} border border-gray-400/70 shadow-lg
                 transition-transform duration-300 hover:scale-105 hover:border-accent-primary/75`}
    >
      <Link
        to={`/genre/${id}?mediaType=${defaultMediaType}&name=${encodeURIComponent(name)}`}
        className="block h-full w-md"
      >
        {/* Optional subtle overlay tint */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Shine overlay (uses .group:hover .shine-overlay from MediaCard.css) */}
        <span className="shine-overlay" />

        {/* Content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center text-center">
          <h3 className="text-3xl font-semibold text-white text-shadow-lg">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default GenreCard;
