import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ThumbsUp, ThumbsDown } from "lucide-react";
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
import RatingPill from "../ui/RatingPill";
import { useDelayHover } from "../../hooks/useDelayHover";
import { useUser } from "../../hooks/user/useUser";
import { mediaUrl } from "../../utils/urlBuilder";
import type { AiDiscoverResult } from "../../types/aiDiscover";
import type { DetailMedia } from "../../types/tmdb";

type AiResultCardProps = {
  result: AiDiscoverResult;
  detail?: DetailMedia;
  isLoading: boolean;
  isError: boolean;
  onLike?: () => void;
  onDislike?: () => void;
  liked?: boolean;
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
  onLike,
  onDislike,
  liked,
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

        <RatingPill
          rating={detail?.vote_average}
          className="absolute top-1 left-1 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-10"
          showOutOfTen={false}
        />

        {user && hoverEnabled && (
          <button
            onClick={handleAddToList}
            aria-label="Add to list"
            className="absolute top-2 right-2 z-10 p-2.5 rounded-xl bg-primary/40 border border-badge-foreground/40 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary/70 hover:border-accent-primary/75 transition-all duration-300 hover:cursor-pointer"
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

        {(onLike || onDislike) && (
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/10">
            {onLike && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
                aria-label="Like this recommendation"
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
              >
                <ThumbsUp size={16} className={liked ? "fill-current text-green-400" : "text-[var(--subtle)] hover:text-green-400"} />
              </button>
            )}
            {onDislike && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDislike(); }}
                aria-label="Show me something else"
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
              >
                <ThumbsDown size={16} className="text-[var(--subtle)] hover:text-red-400" />
              </button>
            )}
          </div>
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
