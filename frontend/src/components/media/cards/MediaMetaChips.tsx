import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { dateFormatYear } from "../../../utils/dateFormatYear";

type Props = {
  vote_average: number;
  vote_count?: number;
  runtime: number;
  release_date: string;
  media_type?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
};

export default function MediaMetaChips({ 
  vote_average, 
  vote_count, 
  runtime, 
  release_date, 
  media_type,
  number_of_seasons,
  number_of_episodes 
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
      {/* Rating */}
      <p className="font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm flex items-center hover:border-blue-400 transition">
        <FontAwesomeIcon icon={faStar} className="text-amber-400 mr-1" />
        {vote_average ? (
          <>
            <span className="font-bold">{vote_average.toFixed(1)}</span>
            <span>/10</span>
            {vote_count && <span className="ml-1 text-xs text-gray-400">({vote_count.toLocaleString()})</span>}
          </>
        ) : (
        "No rating"
      )}
    </p>
    {/* Runtime for Movies */}
    {media_type === "movie" && (
      <p className="bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:border-blue-400 transition">
        {runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}min` : "No runtime"}
      </p>
    )}

    {/* TV Show Info */}
    {media_type === "tv" && (
      <p className="bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:border-blue-400 transition">
        {number_of_seasons ?? "?"} Season{number_of_seasons === 1 ? "" : "s"}
        {" • "}
        {number_of_episodes ?? "?"} Episode{number_of_episodes === 1 ? "" : "s"}
      </p>
    )}

    {/* Release date */}
    <p className="bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:border-blue-400 transition">
      {dateFormatYear(release_date) || "No date"}
    </p>
    </div>
    );
}
