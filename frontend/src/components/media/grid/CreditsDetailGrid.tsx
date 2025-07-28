import MediaCard from "../../media/cards/MediaCard";

type Credit = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
    vote_count?: number;
    media_type: string;
    runtime?: number;
    number_of_seasons?: number;
    number_of_episodes?: number;
};

type Props = {
  credits: Credit[];
};

const CreditsDetailGrid = ({ credits }: Props) => {
  return (
    <>
    <h2 className="text-lg font-semibold text-white">Known For</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {credits.map((credit) => (
          <MediaCard
          key={`${credit.media_type}-${credit.id}`}
          id={credit.id}
          title={credit.title || credit.name || "Untitled"}
          posterPath={credit.poster_path || ""}
          overview={credit.overview}
          releaseDate={credit.release_date || credit.first_air_date}
          vote_count={credit.vote_count}
          vote_average={credit.vote_average}
          genre_ids={credit.genre_ids}
          media_type={credit.media_type}
            runtime={credit.runtime}
            number_of_seasons={credit.number_of_seasons}
            number_of_episodes={credit.number_of_episodes}
          />
        ))}
    </div>
</>
  );
};

export default CreditsDetailGrid;
