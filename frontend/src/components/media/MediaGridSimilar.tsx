import MediaSimilarCard from './MediaSimilarCard';

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
};

type Props = {
  similarMedia: SimilarMediaItem[];
};

const MediaGridSimilar = ({ similarMedia }: Props) => {
  return (
    <aside className="w-full mt-8">
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
        <h2 className="text-lg font-semibold text-white mb-4">You May Also Like</h2>
        <div className="space-y-2">
          {similarMedia.slice(0, 8).map((media, index) => (
            <MediaSimilarCard
              key={media.id || `similar-${index}`}
              id={media.id}
              poster_path={media.poster_path}
              title={media.title || media.name || 'Unknown Title'}
              releaseDate={media.release_date || media.first_air_date || ''}
              media_type={media.media_type}
              runtime={media.runtime}
              number_of_seasons={media.number_of_seasons}
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