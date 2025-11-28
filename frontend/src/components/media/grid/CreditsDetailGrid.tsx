import MediaCard from "../../media/cards/MediaCard";
import type { DetailMedia, MediaType } from "../../../types/tmdb";

// Define the enriched credit type that has both credit and media info
export interface EnrichedCredit extends DetailMedia {
  character?: string;
  job?: string;
  media_type: MediaType;
}

type Props = {
  credits: EnrichedCredit[]; // Now expects enriched credits
  loading?: boolean;
  error?: string | null;
};

const CreditsDetailGrid = ({
  credits,
  loading = false,
  error = null,
}: Props) => {
  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-white">Known For</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!credits.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-white">Known For</h2>
        <p className="text-gray-400 mt-4">No credits available</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-white">Known For</h2>
        <span className="text-gray-400 text-sm font-medium">
          {credits.length} {credits.length === 1 ? 'title' : 'titles'}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
        {credits.map((credit) => (
          <div key={`${credit.id}-${credit.character || credit.job}`}>
            <MediaCard
              id={credit.id}
              title={credit.title || credit.name || "Untitled"} // Now has both title (movies) and name (TV)
              posterPath={credit.poster_path || ""} // Now has poster_path from DetailMedia
              overview={credit.overview || ""} // Now has overview from DetailMedia
              releaseDate={credit.release_date || credit.first_air_date || ""} // Now has release dates
              vote_count={credit.vote_count} // Now has vote_count from DetailMedia
              vote_average={credit.vote_average} // Now has vote_average from DetailMedia
              genre_ids={credit.genre_ids || []} // Now has genre_ids from DetailMedia
              media_type={credit.media_type} // Now has correct media_type
              runtime={credit.runtime}
              number_of_seasons={credit.number_of_seasons}
              number_of_episodes={credit.number_of_episodes}
            />

            {/* Show character/job info below the card */}
            {credit.character && (
              <p className="text-center text-gray-400 text-sm mt-1">
                as {credit.character}
              </p>
            )}
            {credit.job && (
              <p className="text-center text-gray-400 text-sm mt-1">
                {credit.job}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default CreditsDetailGrid;
