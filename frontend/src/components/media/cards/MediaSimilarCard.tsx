// components/media/cards/MediaSimilarCard.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import MediaCardModal from "../modals/MediaCardModal";
import { usePrefetchMediaDetail } from "../../../hooks/media/useMediaDetail";
import type { MediaType, DetailMedia } from "../../../types/tmdb";
import { truncateText } from "../../../utils/truncateText";
import { useDelayHover } from "../../../hooks/useDelayHover";
import Poster from "../shared/Poster";

type MediaSimilarCardProps = {
  id: number;
  media_type: MediaType; // REQUIRED now
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  original_language?: string;
  // optional UI extras
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
};

const MediaSimilarCard = (p: MediaSimilarCardProps) => {
  const {
    id,
    media_type,
    title,
    name,
    poster_path,
    backdrop_path,
    release_date,
    first_air_date,
    overview,
    vote_average,
    vote_count,
    genre_ids,
    original_language,
    runtime,
    number_of_seasons,
    number_of_episodes,
  } = p;

  const { hovered, onEnter, onLeave, setHovered } = useDelayHover(600);
  const prefetch = usePrefetchMediaDetail();

  const posterForCard = poster_path ?? backdrop_path ?? "";
  const displayTitle = title ?? name ?? "Untitled";
  const titleshort = truncateText(displayTitle);

  const initial = useMemo<Partial<DetailMedia>>(
    () => ({
      title,
      name,
      overview,
      vote_average,
      vote_count,
      genre_ids,
      original_language,
      poster_path: poster_path ?? undefined,
      backdrop_path: backdrop_path ?? poster_path ?? undefined,
      release_date,
      first_air_date,
      runtime,
      number_of_seasons,
      number_of_episodes,
    }),
    [
      title,
      name,
      overview,
      vote_average,
      vote_count,
      genre_ids,
      original_language,
      poster_path,
      backdrop_path,
      release_date,
      first_air_date,
      runtime,
      number_of_seasons,
      number_of_episodes,
    ]
  );

  return (
    <div
      className={`group relative transition-transform duration-300 cursor-pointer h-20 ${
        hovered ? "z-[9999]" : "z-10 hover:z-30"
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link to={`/media/${media_type}/${id}`}>
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-500/20 transition-all duration-200 bg-transparent h-full w-xs">
          <div className="flex-shrink-0">
            <Poster
              path={posterForCard}
              alt={`Poster for ${displayTitle}`}
              useCustomSize
              className="w-12 h-16 rounded shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
            <h3 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate leading-tight">
              {titleshort}
            </h3>
            <p className="text-xs text-gray-400 mt-1 truncate">
              {(release_date ?? first_air_date ?? "Unknown").slice(0, 4)}
              {media_type === "tv" && number_of_seasons
                ? ` • ${number_of_seasons} Season${
                    number_of_seasons > 1 ? "s" : ""
                  }`
                : ""}
              {media_type === "movie" && typeof runtime === "number"
                ? ` • ${Math.floor(runtime / 60)}h ${runtime % 60}min`
                : ""}
            </p>
          </div>
        </div>
      </Link>

      {hovered && (
        <div className="absolute top-0 right-full mr-2">
          <MediaCardModal id={id} media_type={media_type} initial={initial} />
        </div>
      )}
    </div>
  );
};

export default MediaSimilarCard;
