import MediaCard from "../cards/MediaCard";
import type { MediaType, DetailMedia } from "../../../types/tmdb";

type Props = {
  genreMedia: DetailMedia[];
  mediaType?: MediaType;
};

const GenreDetailGrid = ({ genreMedia, mediaType }: Props) => {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-4 mt-4">
        {genreMedia.map((media) => (
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
            media_type={media.media_type}
            runtime={media.runtime}
            number_of_seasons={media.number_of_seasons}
            number_of_episodes={media.number_of_episodes}
          />
        ))}
      </div>
    </>
  );
};

export default GenreDetailGrid;
