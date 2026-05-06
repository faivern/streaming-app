import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import type { MediaType } from "../../../types/tmdb";
import { mediaUrl } from "../../../utils/urlBuilder";
import { dateFormat } from "../../../utils/dateFormat";
import genreMap, { resolveGenreIds } from "../../../utils/genreMap";
import languageMap from "../../../utils/languageMap";
import useMediaRuntime from "../../../hooks/media/useMediaRuntime";

type MediaCardModalProps = {
  id: number;
  media_type: MediaType;
  title: string;
  posterPath: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
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
  original_language,
  runtime,
  number_of_seasons,
  number_of_episodes,
  compact = false,
}: MediaCardModalProps) {
  const lang = original_language
    ? (languageMap[original_language] ?? original_language.toUpperCase())
    : undefined;

  const genres = genre_ids
    ? resolveGenreIds(genre_ids, original_language)
        .slice(0, 3)
        .map((gid) => genreMap[gid])
        .filter(Boolean)
    : [];

  const runtimeDisplay = useMediaRuntime({
    mediaType: media_type,
    runtimeMin: runtime,
    seasons: number_of_seasons,
    episodes: number_of_episodes,
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
            {/* Title + runtime row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={`${compact ? "text-sm" : "text-base"} font-bold text-white leading-tight line-clamp-2`}>
                {title}
              </h3>
              {runtimeDisplay && (
                <span className={`flex items-center gap-1 ${compact ? "text-[11px]" : "text-xs"} text-[var(--subtle)] shrink-0`}>
                  <Clock className="h-3 w-3" />
                  {runtimeDisplay}
                </span>
              )}
            </div>

            {/* Metadata: date + language */}
            <p className={`${compact ? "text-[11px]" : "text-xs"} text-[var(--subtle)] mt-1`}>
              {[dateFormat(releaseDate), lang].filter(Boolean).join(" \u2022 ")}
            </p>

            {/* Divider */}
            <div className="h-px bg-[var(--outline)]/50 my-1.5" />

            {/* Genres */}
            {genres.length > 0 && (
              <p className={`${compact ? "text-[11px]" : "text-xs"} text-accent-primary truncate`}>
                {genres.join(" \u2022 ")}
              </p>
            )}

            {/* Overview */}
            {overview && (
              <p className={`${compact ? "text-[11px] line-clamp-3" : "text-xs line-clamp-4"} text-gray-300 mt-1 leading-relaxed`}>
                {overview}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
