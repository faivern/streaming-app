import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import Poster from "../media/shared/Poster";
import MediaCardModal from "../media/modals/MediaCardModal";
import AddToListModal from "../lists/modals/AddToListModal";
import { useDelayHover } from "../../hooks/useDelayHover";
import { useUser } from "../../hooks/user/useUser";
import { mediaUrl } from "../../utils/urlBuilder";
import { matchScoreBadge } from "./animations";
import type { AiDiscoverResult } from "../../types/aiDiscover";
import type { DetailMedia } from "../../types/tmdb";

type AiResultCardProps = {
  result: AiDiscoverResult;
  detail?: DetailMedia;
  isLoading: boolean;
  isError: boolean;
};

function formatRuntime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function AiResultCard({
  result,
  detail,
  isLoading,
  isError,
}: AiResultCardProps) {
  const { hovered, onEnter, onLeave, setHovered } = useDelayHover();
  const [addToListOpen, setAddToListOpen] = useState(false);
  const { data: user } = useUser();

  const hoverEnabled = !isLoading && !isError && Boolean(detail);

  const { refs, floatingStyles } = useFloating({
    placement: "right",
    middleware: hoverEnabled ? [offset(6), flip(), shift()] : [],
    whileElementsMounted: hoverEnabled ? autoUpdate : undefined,
  });

  const matchPercent = Math.round(result.matchScore * 100);
  const posterPath = detail?.poster_path ?? "";
  const releaseDate = detail?.release_date ?? detail?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const runtimeText = formatRuntime(detail?.runtime);
  const genreIds = detail?.genres?.map((g) => g.id);

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddToListOpen(true);
  };

  const cardContent = (
    <>
      {/* Poster + score-badge area */}
      <div className="relative">
        {isLoading ? (
          <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-t-2xl" />
        ) : (
          <Poster
            path={posterPath}
            alt={result.title}
            className="w-full"
          />
        )}

        {/* Match-score badge — animated stamp */}
        <motion.div
          variants={matchScoreBadge}
          className="absolute top-2 right-2 z-10"
        >
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[var(--accent-primary)] text-[var(--background)] shadow-lg shadow-black/40 ring-2 ring-[var(--accent-primary)]/30">
            <span className="text-base font-bold leading-none">
              {matchPercent}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70 leading-none mt-0.5">
              match
            </span>
          </div>
        </motion.div>

        {/* Quick-add — logged-in only, mirrors MediaCard pattern */}
        {user && hoverEnabled && (
          <button
            onClick={handleAddToList}
            aria-label="Add to list"
            className="absolute top-2 left-2 z-10 p-2.5 rounded-xl bg-primary/40 border border-badge-foreground/40 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary/70 hover:border-accent-primary/75 transition-all duration-300 hover:cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Metadata strip */}
      <div className="p-3 space-y-1.5">
        {isLoading ? (
          <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
        ) : (
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {result.title}
          </h3>
        )}

        {!isLoading && (year || runtimeText) && (
          <div className="flex items-center gap-2 text-xs text-[var(--subtle)]">
            {year && <span>{year}</span>}
            {runtimeText && <span>· {runtimeText}</span>}
          </div>
        )}

        {result.explanation && (
          <p className="text-xs text-[var(--subtle)] italic line-clamp-2 leading-relaxed">
            {result.explanation}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div
      ref={hoverEnabled ? refs.setReference : undefined}
      className="relative w-full"
      onMouseEnter={hoverEnabled ? onEnter : undefined}
      onMouseLeave={hoverEnabled ? onLeave : undefined}
      onFocus={hoverEnabled ? () => setHovered(true) : undefined}
      onBlur={hoverEnabled ? () => setHovered(false) : undefined}
    >
      <div
        className={`group relative z-10 hover:z-30 ${hovered ? "z-30" : ""} transition-transform duration-300`}
      >
        <div className="bg-[var(--component-primary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg hover:shadow-xl hover:border-accent-primary/75 transition-all duration-500 ease-out">
          <Link
            to={mediaUrl(result.mediaType, result.tmdbId, result.title)}
            className="block"
          >
            {cardContent}
          </Link>
        </div>

        {/* Floating hover modal — desktop only, requires loaded detail */}
        {hoverEnabled && hovered && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="hidden lg:block z-(--z-dropdown) pointer-events-none animate-[fadeIn_0.15s_ease-out]"
          >
            <MediaCardModal
              id={result.tmdbId}
              media_type={result.mediaType}
              title={result.title}
              posterPath={posterPath}
              overview={detail?.overview}
              releaseDate={releaseDate}
              vote_average={detail?.vote_average}
              genre_ids={genreIds}
              original_language={detail?.original_language}
              runtime={detail?.runtime}
              number_of_seasons={detail?.number_of_seasons}
              number_of_episodes={detail?.number_of_episodes}
            />
          </div>
        )}
      </div>

      <AddToListModal
        isOpen={addToListOpen}
        onClose={() => setAddToListOpen(false)}
        media={{
          tmdbId: result.tmdbId,
          mediaType: result.mediaType,
          title: result.title,
          posterPath: posterPath || null,
          overview: detail?.overview ?? null,
          voteAverage: detail?.vote_average ?? null,
        }}
      />
    </div>
  );
}
