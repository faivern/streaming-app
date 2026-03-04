import MediaCard from "../cards/MediaCard";
import MediaCardSkeleton from "../skeleton/MediaCardSkeleton";
import type { MediaType, DetailMedia } from "../../../types/tmdb";

type Props = {
  genreMedia: DetailMedia[];
  mediaType?: MediaType;
  loading?: boolean;
};

const GenreDetailGrid = ({ genreMedia, mediaType, loading = false }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 4xl:grid-cols-6 gap-4 mt-4 p-2">
      {loading
        ? Array.from({ length: 18 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))
        : genreMedia.map((media) => (
            <MediaCard
              key={`${mediaType}-${media.id}`}
              id={media.id}
              title={media.title || media.name || "Untitled"}
              posterPath={media.poster_path || ""}
              overview={media.overview}
              releaseDate={media.release_date || media.first_air_date}
              vote_count={media.vote_count}
              vote_average={media.vote_average}
              genre_ids={media.genre_ids}
              media_type={media.media_type || "movie" || "tv"}
              runtime={media.runtime}
              number_of_seasons={media.number_of_seasons}
              number_of_episodes={media.number_of_episodes}
            />
          ))}
    </div>
  );
};

export default GenreDetailGrid;
