import MediaCard from "../cards/MediaCard";

type detailMediaGenre = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
  vote_count?: number;
  runtime?: number;
  media_type?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
};

type Props = {
  genreMedia: detailMediaGenre[];
  mediaType?: "movie" | "tv";
};

const GenreDetailGrid = ({ genreMedia, mediaType }: Props) => {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
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
