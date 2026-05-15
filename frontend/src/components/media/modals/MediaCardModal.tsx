import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import type { MediaType } from "../../../types/tmdb";
import { mediaUrl } from "../../../utils/urlBuilder";
import { dateFormatYear } from "../../../utils/dateFormatYear";
import genreMap, { resolveGenreIds } from "../../../utils/genreMap";
import useMediaRuntime from "../../../hooks/media/useMediaRuntime";
import { useCardDetails } from "../../../hooks/media/useMediaCardDetails";

type MediaCardModalProps = {
  id: number;
  media_type: MediaType;
  title: string;
  posterPath: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  compact?: boolean;
};

export default function MediaCardModal({
  id,
  media_type,
  title,
  posterPath,
  overview,
  releaseDate,
  genre_ids,
  runtime,
  number_of_seasons,
  number_of_episodes,
  compact = false,
}: MediaCardModalProps) {
  const needsDetail =
    runtime == null && number_of_seasons == null && number_of_episodes == null;
  const { data: detail } = useCardDetails(
    needsDetail ? media_type : undefined,
    needsDetail ? id : undefined,
  );

  const resolvedRuntime = runtime ?? detail?.runtime;
  const resolvedSeasons = number_of_seasons ?? detail?.number_of_seasons;
  const resolvedEpisodes = number_of_episodes ?? detail?.number_of_episodes;

  const year = dateFormatYear(releaseDate);

  const genres = genre_ids
    ? resolveGenreIds(genre_ids)
        .slice(0, 3)
        .map((gid) => genreMap[gid])
        .filter(Boolean)
    : [];

  const runtimeDisplay = useMediaRuntime({
    mediaType: media_type,
    runtimeMin: resolvedRuntime,
    seasons: resolvedSeasons,
    episodes: resolvedEpisodes,
  });

  return (
    <Link to={mediaUrl(media_type, id, title)}>
      <div className={`${compact ? "w-80 p-3" : "w-96 p-4"} bg-[var(--card)]/95 backdrop-blur-md border border-[var(--outline)]/70 rounded-xl shadow-2xl`}>
        <div className={`flex ${compact ? "gap-3" : "gap-4"}`}>
          {/* Poster thumbnail — same base path as card, browser cache hit */}
          {posterPath && (
            <div className={`flex-shrink-0 ${compact ? "w-20" : "w-28"}`}>
              <img
                src={`https://image.tmdb.org/t/p/w154${posterPath}`}
                alt={title}
                className="w-full aspect-[2/3] object-cover rounded-lg"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Info panel */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className={`${compact ? "text-sm" : "text-base"} font-bold text-white leading-tight line-clamp-2`}>
              {title}
            </h3>

            {/* Meta row */}
            {(year || runtimeDisplay) && (
              <div className={`flex flex-wrap items-center gap-x-3 mt-1.5 ${compact ? "text-[11px]" : "text-xs"} text-[var(--subtle)]`}>
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {year}
                  </span>
                )}
                {runtimeDisplay && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {runtimeDisplay}
                  </span>
                )}
              </div>
            )}

            {/* Genre chips */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {genres.map((g) => (
                  <span
                    key={g}
                    className={`${compact ? "text-[11px]" : "text-xs"} px-2 py-0.5 rounded-full bg-white/[0.08] text-[var(--subtle)]`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {overview && (
              <>
                <div className="h-px bg-[var(--outline)]/50 my-1.5" />
                <p className={`${compact ? "text-[11px] line-clamp-3" : "text-xs line-clamp-4"} text-gray-300 leading-relaxed`}>
                  {overview}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
