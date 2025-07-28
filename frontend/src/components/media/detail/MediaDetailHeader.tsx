import React from "react";
import { dateFormat } from "../../../utils/dateFormat";
import genreMap from "../../../utils/genreMap";
import MediaPosterActions from "./MediaPosterActions";
import MediaMetaChips from "../cards/MediaMetaChips";
import MediaDetails from "./MediaDetails";

type ProductionCompany = {
  id: number;
  name: string;
};

type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  order?: number;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
};

type Props = {
  cast: CastMember[];
  crew: CrewMember[];
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count?: number;
  genre_ids: number[];
  country?: string;
  original_language?: string;
  production_companies?: ProductionCompany[];
  tagline?: string;
  onWatchNow: () => void;
  number_of_episodes?: number;
  media_type?: string;
  number_of_seasons?: number;
  keywords?: string[];
  budget?: number;
  logo_path?: string;
  revenue?: number;
};

export default function MediaDetailHeader({
  cast,
  crew,
  title,
  overview,
  poster_path,
  backdrop_path,
  release_date,
  runtime,
  vote_average,
  vote_count,
  genre_ids,
  country,
  original_language,
  production_companies,
  tagline,
  onWatchNow,
  number_of_episodes,
  media_type,
  number_of_seasons,
  keywords = [],
  budget,
  logo_path,
  revenue,
}: Props) {
  return (
    <main className="relative flex flex-col md:flex-row gap-8 m-4 py-8 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Poster and Actions */}
      <div className="flex-shrink-0 w-full md:w-1/3 max-w-[360px] mx-auto">
        <div className="relative">
        <img
          loading="lazy"
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title}
          className="w-full aspect-[2/3] object-cover rounded-3xl shadow-lg border border-slate-600/30"
          />
          {logo_path && (
            <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded">
            <img
            loading="lazy"
            src={`https://image.tmdb.org/t/p/w92${logo_path}`}
            alt={`${title} logo`}
            className="object-contain h-5"
            />
            </div>
          )}
          </div>
        <MediaPosterActions onWatchNow={onWatchNow} />
      </div>

      {/* Details */}
      <div className="mx-4 flex flex-col gap-6">
        <div>
          <div className="flex flex-row items-center gap-32">

          <h1 className="text-4xl font-bold text-white">{title}</h1>
          </div>
          {tagline && <p className="text-gray-400 italic mt-2">{tagline}</p>}
        </div>

        <MediaMetaChips
          runtime={runtime}
          vote_average={vote_average}
          vote_count={vote_count}
          release_date={release_date}
          media_type={media_type}
          number_of_seasons={number_of_seasons}
          number_of_episodes={number_of_episodes}
        />

        {genre_ids.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genre_ids.map((id) => (
              <span
                key={id}
                className="px-2 py-1 text-sm rounded-full bg-blue-800/70 text-white border border-blue-600/30"
              >
                {genreMap[id] || "Unknown"}
              </span>
            ))}
          </div>
        )}

        {overview && <p className="text-gray-300">{overview}</p>}

        <MediaDetails
          cast={cast}
          crew={crew}
          release_date={release_date}
          country={country}
          language={original_language}
          production_companies={production_companies}
          keywords={keywords}
          budget={budget}
          revenue={revenue}
        />
      </div>
    </main>
  );
}
