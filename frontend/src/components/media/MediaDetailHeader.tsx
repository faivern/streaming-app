import React from "react";
import { dateFormat } from "../../utils/dateFormat";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FaPlay, FaPlus } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import genreMap from "../../utils/genreMap";
import languageMap from "../../utils/languageMap";

type Props = {
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genre_ids: number[];
  country?: string;
  original_language?: string;
  production_companies?: string;
  tagline?: string;
  vote_count?: number;
};

export default function MediaDetailHeader({
  title,
  overview,
  poster_path,
  backdrop_path,
  release_date,
  runtime,
  vote_average,
  genre_ids,
  country,
  original_language,
  production_companies,
  tagline,
  vote_count,
}: Props) {
  return (
    <main className="relative z-10 flex flex-col md:flex-row gap-8 m-4 py-8 px-4 md:px-12 max-w-7xl mx-auto border-t-1 border-gray-500/80">
      {/* Poster */}
      <div className="flex-shrink-0 w-full md:w-1/3 max-w-[360px] mx-auto">
        <img
          loading="lazy"
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title}
          className="w-full aspect-[2/3] object-cover max-w-[360px] mx-auto rounded-3xl shadow-lg z-10"
        />
        <div className="mt-4 flex items-center justify-center gap-4">
          {/* Buttons */}
          <button className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-700 cursor-pointer transition flex items-center text-sm">
            <FaPlay className="mr-2" />
            <span>Watch Trailer</span>
          </button>
          <button className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-700 cursor-pointer transition flex items-center text-sm">
            <FaPlus className="mr-2" />
            <span>Add to Watchlist</span>
          </button>
        </div>
      </div>

      {/* Text content */}
      <div className="mx-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        {tagline && <p className="text-gray-400 italic mt-2">{tagline}</p>}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm my-4">
          {/* Rating */}
          <p
            className="text-sm font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm 
            hover:shadow-md hover:border-blue-400 transition flex items-center"
          >
            <FontAwesomeIcon icon={faStar} className="mr-1 text-amber-400" />
            {vote_average ? (
              <>
                <span className="font-bold">{vote_average.toFixed(1)}</span>
                <span>/10</span>
              </>
            ) : (
              "No rating"
            )}
          </p>

          {/* Runtime */}
          <p className="bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:border-blue-400 transition">
            {runtime
              ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
              : "No runtime"}
          </p>

          {/* Release date */}
          <p className="text-sm font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:shadow-md hover:border-blue-400 transition">
            {dateFormat(release_date) || "No date"}
          </p>

          {/* Overview */}
          <p className="text-gray-300">{overview}</p>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-16 text-gray-400 text-sm mt-12">
          <strong className="text-white whitespace-nowrap">Country:</strong>
          <p>{country || "N/A"}</p>

          <strong className="text-white whitespace-nowrap">Genres:</strong>
          <p>
            {Array.isArray(genre_ids) &&
              genre_ids.map((id: number, idx) => (
                <span key={id}>
                  {genreMap[id] || "Genre Unknown"}
                  {genre_ids && idx !== genre_ids.length - 1 && ", "}
                </span>
              ))}
          </p>

          <strong className="text-white whitespace-nowrap">IMDb:</strong>
          <p>
            {vote_average.toFixed(1)}/10 by {vote_count?.toLocaleString()}{" "}
            reviews
          </p>

          <strong className="text-white whitespace-nowrap">Language:</strong>
          <p>
            {original_language
              ? languageMap[original_language] || "Language Unknown"
              : "Language Unknown"}
          </p>

          <strong className="text-white whitespace-nowrap">
            Release Date:
          </strong>
          <p>{dateFormat(release_date)}</p>

          <strong className="text-white whitespace-nowrap">Production:</strong>
          <p>{production_companies}</p>

          <strong className="text-white whitespace-nowrap">Director:</strong>
          <p>director</p>

          <strong className="text-white whitespace-nowrap">Cast:</strong>
          <p>actors</p>

          <strong className="text-white whitespace-nowrap">Tags:</strong>
          <p>keywords</p>
        </div>
      </div>
    </main>
  );
}
