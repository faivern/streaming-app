import RatingPill from "../../ui/RatingPill";
import RuntimePill from "../../ui/RuntimePill";
import TvInfoPill from "../../ui/TvInfoPill";
import DatePill from "../../ui/DatePill";
import GenrePill from "../../ui/GenrePill";

type Props = {
  vote_average: number;
  vote_count?: number;
  runtime: number;
  release_date: string;
  media_type?: "movie" | "tv";
  number_of_seasons?: number;
  number_of_episodes?: number;
  genre_ids: number[];
};
export default function MediaMetaChips({
  vote_average,
  vote_count,
  runtime,
  release_date,
  media_type,
  number_of_seasons,
  number_of_episodes,
  genre_ids = [],
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
      <RatingPill rating={vote_average} count={vote_count} showOutOfTen={true} />
      {media_type === "movie" && <RuntimePill minutes={runtime} />}
      {media_type === "tv" && (
        <TvInfoPill seasons={number_of_seasons} episodes={number_of_episodes} />
      )}
      <DatePill date={release_date} longDate={false} />
      <div className="basis-full flex flex-wrap gap-2 mt-1">
        {genre_ids.map((id) => (
          <GenrePill key={id} id={id} className="" />
        ))}
      </div>
    </div>
  );
}
