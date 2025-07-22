import { dateFormatYear } from "../../../utils/dateFormatYear";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import MediaCardModal from "../modals/MediaCardModal";

type MediaSimilarCardProps = {
  id: number;
  poster_path: string;
  title: string;
  releaseDate: string;
  media_type?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  original_language?: string;
  backdrop_path?: string;
  index?: number;
};

const MediaSimilarCard = ({ 
  id, 
  poster_path, 
  title, 
  releaseDate, 
  media_type, 
  runtime, 
  number_of_seasons,
  number_of_episodes,
  overview,
  vote_average,
  vote_count,
  genre_ids,
  original_language,
  backdrop_path,
  index = 0 
}: MediaSimilarCardProps) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={cardRef}
    >
      {/* Main card content */}
      <div className={`group relative transition-transform duration-300 cursor-pointer ${
        hovered ? 'z-[9999]' : 'z-10 hover:z-30'
      }`}>
        <Link to={`/media/${media_type || 'movie'}/${id}`}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-500/20 transition-all duration-200 cursor-pointer group bg-transparent">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img 
                src={poster_path ? `https://image.tmdb.org/t/p/w92${poster_path}` : '/placeholder-poster.png'}
                alt={`Poster for ${title}`}
                className="w-12 h-16 rounded object-cover shadow-md group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                {title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {dateFormatYear(releaseDate) || 'Unknown'}
                {media_type === 'tv' && number_of_seasons ? ` • ${number_of_seasons} Season${number_of_seasons > 1 ? 's' : ''}` : ''}
                {media_type === 'movie' && runtime ? ` • ${Math.floor(runtime / 60)}h ${runtime % 60}min` : ''}
              </p>
            </div>
          </div>
        </Link>

        {/* Modal - Positioned to the LEFT */}
        {hovered && (
          <div className="absolute top-0 right-full z-50 mr-2">
            <MediaCardModal
              id={id}
              title={title}
              backdrop={backdrop_path || poster_path}
              overview={overview || ""}
              releaseDate={releaseDate}
              vote_average={vote_average || 0}
              genre_ids={genre_ids || []}
              vote_count={vote_count || 0}
              original_language={original_language || ""}
              runtime={runtime || 0}
              number_of_seasons={number_of_seasons || 0}
              media_type={media_type}
              number_of_episodes={number_of_episodes || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSimilarCard;