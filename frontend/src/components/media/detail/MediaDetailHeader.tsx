// src/components/media/detail/MediaDetailHeader.tsx
import { useState } from "react";
import MediaPosterActions from "./MediaPosterActions";
import MediaMetaChips from "../cards/MediaMetaChips";
import MediaDetails from "./MediaDetails";
import type { DetailMedia, Credit, MediaType } from "../../../types/tmdb";

type Props = {
  details: DetailMedia;      // <-- single object
  cast: Credit[];
  crew: Credit[];
  keywords?: string[];
  media_type?: MediaType;    // optional override; header will fallback to details.media_type
  onWatchNow: () => void;
  logo_path?: string;
};

export default function MediaDetailHeader({
  details,
  cast,
  crew,
  keywords = [],
  media_type,
  onWatchNow,
}: Props) {
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  // Normalize once for UI
  const title = details.title ?? details.name ?? "No title available.";
  const posterPath = details.poster_path ?? "";
  const backdropPath = details.backdrop_path ?? ""; // keep if you'll use it later
  const releaseDate = details.release_date ?? details.first_air_date ?? "";
  const runtime = details.runtime ?? details.episode_run_time?.[0] ?? 0;
  const voteAverage = details.vote_average ?? 0;
  const voteCount = details.vote_count ?? 0;
  const genreIds = details.genre_ids ?? details.genres?.map((g) => g.id) ?? [];
  const country =
    details.production_countries?.[0]?.name ?? details.origin_country?.[0] ?? "";
  const language = details.original_language ?? "";
  const companies = details.production_companies ?? [];
  const tagline = details.tagline ?? "";
  const seasons = details.number_of_seasons;
  const episodes = details.number_of_episodes;
  const budget = details.budget;
  const revenue = details.revenue;

  return (
    <section className="relative flex flex-col md:flex-row gap-6 md:gap-8 py-8 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Poster and Actions */}
      <div className="flex-shrink-0 w-full md:w-1/3 max-w-[360px] mx-auto">
        <div className="relative">
          <img
            loading="lazy"
            decoding="async"
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            srcSet={`https://image.tmdb.org/t/p/w342${posterPath} 342w, https://image.tmdb.org/t/p/w500${posterPath} 500w`}
            sizes="(max-width: 768px) 100vw, 360px"
            alt={title}
            className="w-full aspect-[2/3] object-cover rounded-3xl shadow-lg border border-slate-600/30"
          />
{/*
               {logo_path && (              <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded">           <img
                     loading="lazy"                  src={`https://image.tmdb.org/t/p/w154${logo_path}`}
                alt={`${title} logo`}
                className="object-contain h-5"
              />
            </div>
          )}
*/}

   </div>
        <MediaPosterActions
          onWatchNow={onWatchNow}
          mediaId={details.id}
          mediaType={media_type ?? details.media_type ?? "movie"}
          title={title}
          posterPath={posterPath}
          backdropPath={backdropPath}
          overview={details.overview}
          voteAverage={voteAverage}
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-row items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{title}</h1>
          </div>
          {tagline && <p className="text-gray-400 italic mt-2">{tagline}</p>}
        </div>

        <MediaMetaChips
          runtime={runtime}
          vote_average={voteAverage}
          vote_count={voteCount}
          release_date={releaseDate}
          media_type={media_type ?? details.media_type}
          number_of_seasons={seasons}
          number_of_episodes={episodes}
          genre_ids={genreIds}
          imdb_id={details.imdb_id ?? details.external_ids?.imdb_id}
        />

        {details.overview && (
          <div className="mt-2">
            <h2 className="text-2xl font-bold text-text-h1 mb-3">Overview</h2>
            <p className={`text-gray-300 leading-relaxed sm:line-clamp-none ${overviewExpanded ? "" : "line-clamp-3"}`}>
              {details.overview}
            </p>
            <button
              onClick={() => setOverviewExpanded(!overviewExpanded)}
              className="mt-1 text-accent-primary text-sm font-medium sm:hidden"
            >
              {overviewExpanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}

        <MediaDetails
          cast={cast}
          crew={crew}
          release_date={releaseDate}
          country={country}
          language={language}
          production_companies={companies}
          keywords={keywords}
          budget={budget}
          revenue={revenue}
          media_type={media_type ?? details.media_type}
          created_by={details.created_by}
        />
      </div>
    </section>
  );
}
