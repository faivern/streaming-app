import MediaSimilarCard from '../cards/MediaSimilarCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

type SimilarMediaItem = {
  id: number;
  poster_path: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
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
};

type Props = {
  similarMedia: SimilarMediaItem[];
};

const MediaGridSimilar = ({ similarMedia }: Props) => {
  return (
    <aside className="mt-8 shadow-lg w-md:max-w-6xl">
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30 overflow-visible">
        <h2 className="text-lg font-semibold text-white mb-4">
          <FontAwesomeIcon icon={faPlay} className="text-md pr-2" />
          You may also like
        </h2>
        {/* Fixed grid layout with consistent spacing */}
        <div className="grid grid-cols-1 gap-2">
          {similarMedia.slice(0, 8).map((media, index) => (
            <MediaSimilarCard
              key={`${media.id}-${media.media_type}`}
              id={media.id}
              poster_path={media.poster_path}
              title={media.title ? media.title.slice(0, 22) + (media.title.length > 22 ? "..." : "") : media.name || 'Unknown Title'}
              releaseDate={media.release_date || media.first_air_date || ''}
              media_type={media.media_type}
              runtime={media.runtime}
              number_of_seasons={media.number_of_seasons}
              number_of_episodes={media.number_of_episodes}
              overview={media.overview}
              vote_average={media.vote_average}
              vote_count={media.vote_count}
              genre_ids={media.genre_ids}
              original_language={media.original_language}
              backdrop_path={media.backdrop_path}
              index={index}
            />
          ))}
          
          {similarMedia.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              No similar titles found
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default MediaGridSimilar;