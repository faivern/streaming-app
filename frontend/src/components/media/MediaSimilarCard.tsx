import { dateFormatYear } from "../../utils/dateFormatYear";
import { Link } from "react-router-dom";

type MediaSimilarCardProps = {
  id: number;
  poster_path: string;
  title: string;
  releaseDate: string;
  media_type?: string;
  runtime?: number;
  number_of_seasons?: number;
};

const MediaSimilarCard = ({ id, poster_path, title, releaseDate, media_type, runtime, number_of_seasons }: MediaSimilarCardProps) => {
  return (
    <div className="">
      <Link to={`/media/${media_type || 'movie'}/${id}`}>
        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group shadow-sm">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img 
              src={poster_path ? `https://image.tmdb.org/t/p/w92${poster_path}` : '/placeholder-poster.png'}
              alt={`Poster for ${title}`}
              className="w-12 h-16 rounded object-cover shadow-md group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
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
    </div>
  );
};


export default MediaSimilarCard;