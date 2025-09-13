import MediaSimilarCard from '../cards/MediaSimilarCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import type { DetailMedia } from '../../../types/tmdb';

type Props = {
  similarMedia: DetailMedia[];
};

const MediaGridSimilar = ({ similarMedia }: Props) => {

  const startMediaToShow = 0;
  const endMediaToShow = 8;

  const startTitleToShow = 0;
  const endTitleToShow = 22;

  return (
    <aside className="mt-8 shadow-lg w-md:max-w-6xl">
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30 overflow-visible">
        <h2 className="text-lg font-semibold text-white mb-4">
          <FontAwesomeIcon icon={faPlay} className="text-md pr-2" />
          You may also like
        </h2>
        {/* Fixed grid layout with consistent spacing */}
        <div className="grid grid-cols-1 gap-2">
          {similarMedia.slice(startMediaToShow, endMediaToShow).map((media, index) => (
            <MediaSimilarCard
              key={`${media.id}-${media.media_type}`}
              id={media.id}
              poster_path={media.poster_path || ''}
              title={media.title ? media.title.slice(startTitleToShow, endTitleToShow) + (media.title.length > endTitleToShow ? "..." : "") : media.name || 'Unknown Title'}
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
              backdrop_path={media.backdrop_path || ''}
              index={index}
            />
          ))}
          
          {!similarMedia.length && (
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