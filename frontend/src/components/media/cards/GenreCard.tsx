import { Link } from "react-router-dom";
import { getGenreColor } from "../../../theme/genreColors";
import type { MediaType } from "../../../types/tmdb";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";

type GenreCardProps = {
  id: number;
  name: string;
  supportedMediaTypes?: MediaType[];
  backdropPath?: string | null;
};

const GenreCard = ({ id, name, supportedMediaTypes, backdropPath }: GenreCardProps) => {
  // Use first supported type (movie if available, else tv)
  const defaultMediaType: MediaType =
    supportedMediaTypes?.includes("movie") ? "movie" : "tv";

  const hasBackdrop = !!backdropPath;
  const backdropUrl = hasBackdrop ? `${TMDB_IMAGE_BASE}${backdropPath}` : null;

  return (
    <div
      className={`group relative h-48 rounded-lg overflow-hidden
                 ${!hasBackdrop ? getGenreColor(id) : ""} border border-gray-400/30 shadow-lg
                 transition-transform duration-300 hover:scale-105 hover:border-accent-primary/75`}
    > 
      <Link
        to={`/genre/${id}?mediaType=${defaultMediaType}&name=${encodeURIComponent(name)}`}
        className="block h-full w-md"
      >
        {/* Backdrop image */}
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Tint overlay - darker for backdrop images to ensure text readability */}
        <div className={`absolute inset-0 ${hasBackdrop ? "bg-black/50" : "bg-black/10"}`} />

        {/* Content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center text-center px-4">
          <h3 className="text-3xl font-semibold text-white text-shadow-lg">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default GenreCard;
