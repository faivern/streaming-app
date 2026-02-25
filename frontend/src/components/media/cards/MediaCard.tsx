import { useState } from "react";
import MediaCardModal from "../modals/MediaCardModal";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Poster from "../../media/shared/Poster";
import RatingPill from "../../ui/RatingPill";
import AddToListModal from "../../lists/modals/AddToListModal";
import type { MediaType } from "../../../types/tmdb";
import { useDelayHover } from "../../../hooks/useDelayHover";
import { useUser } from "../../../hooks/user/useUser";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";

type MediaCardProps = {
  id: number;
  media_type: MediaType;
  title: string;
  posterPath: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genre_ids?: number[];
  vote_count?: number;
  original_language?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  disableHoverModal?: boolean;
  showQuickAdd?: boolean;
  onClick?: () => void;
};

export default function MediaCard(props: MediaCardProps) {
  const {
    id,
    title,
    posterPath,
    media_type,
    overview,
    releaseDate,
    vote_average,
    genre_ids,
    original_language,
    runtime,
    number_of_seasons,
    number_of_episodes,
    disableHoverModal = false,
    showQuickAdd = true,
    onClick,
  } = props;

  const { hovered, onEnter, onLeave, setHovered } = useDelayHover();
  const [addToListOpen, setAddToListOpen] = useState(false);
  const { data: user } = useUser();

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddToListOpen(true);
  };

  const { refs, floatingStyles } = useFloating({
    placement: "right",
    middleware: disableHoverModal ? [] : [offset(6), flip(), shift()],
    whileElementsMounted: disableHoverModal ? undefined : autoUpdate,
  });

  return (
    <div
      ref={disableHoverModal ? undefined : refs.setReference}
      className="relative w-full mx-auto"
      onMouseEnter={disableHoverModal ? undefined : onEnter}
      onMouseLeave={disableHoverModal ? undefined : onLeave}
      onFocus={disableHoverModal ? undefined : () => setHovered(true)}
      onBlur={disableHoverModal ? undefined : () => setHovered(false)}
    >
      <div className="group relative z-10 hover:z-30 transition-transform duration-300 cursor-pointer">
        <div
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
  rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
  hover:shadow-xl hover:scale-105 hover:border-accent-primary/75 transition-all duration-300 relative group"
        >
          {(() => {
            const cardContent = (
              <>
                <RatingPill
                  rating={vote_average}
                  className="absolute top-1 right-1 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  showOutOfTen={false}
                />

                {user && showQuickAdd && (
                  <button
                    onClick={handleAddToList}
                    aria-label="Add to list"
                    className="absolute top-1 left-1 z-10 p-3 rounded-xl bg-primary/40 border border-badge-foreground/40 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary/70 hover:border-accent-primary/75 transition-all duration-300 hover:cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}

                {/* Poster */}
                <Poster
                  path={posterPath}
                  alt={title}
                  className="w-full"
                  priority={false}
                />

                {/* Hover gradient overlay with title */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {title}
                  </h3>
                </div>
              </>
            );

            return onClick ? (
              <div
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onClick();
                }}
              >
                {cardContent}
              </div>
            ) : (
              <Link to={`/media/${media_type}/${id}`}>{cardContent}</Link>
            );
          })()}
        </div>
        {/* Floating hover modal (disabled inside constrained containers like modals) */}
        {!disableHoverModal && hovered && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="hidden lg:block z-(--z-dropdown)"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <MediaCardModal
              id={id}
              title={title}
              backdrop={posterPath}
              overview={overview}
              releaseDate={releaseDate}
              genre_ids={genre_ids ?? []}
              original_language={original_language}
              runtime={runtime}
              number_of_seasons={number_of_seasons}
              media_type={media_type}
              number_of_episodes={number_of_episodes}
            />
          </div>
        )}
      </div>

      <AddToListModal
        isOpen={addToListOpen}
        onClose={() => setAddToListOpen(false)}
        media={{
          tmdbId: id,
          mediaType: media_type,
          title,
          posterPath: posterPath ?? null,
          overview: overview ?? null,
          voteAverage: vote_average ?? null,
        }}
      />
    </div>
  );
}
