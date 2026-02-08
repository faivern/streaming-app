import MediaCardModal from "../modals/MediaCardModal";
import { Link } from "react-router-dom";
import Poster from "../../media/shared/Poster";
import RatingPill from "../../ui/RatingPill";
import type { MediaType } from "../../../types/tmdb";
import { useDelayHover } from "../../../hooks/useDelayHover";
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
    vote_count,
    original_language,
    runtime,
    number_of_seasons,
    number_of_episodes,
    disableHoverModal = false,
    onClick,
  } = props;

  const { hovered, onEnter, onLeave, setHovered } = useDelayHover();

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
              <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}>
                {cardContent}
              </div>
            ) : (
              <Link to={`/media/${media_type}/${id}`}>
                {cardContent}
              </Link>
            );
          })()}
        </div>
        {/* Floating hover modal (disabled inside constrained containers like modals) */}
        {!disableHoverModal && hovered && (
          <div ref={refs.setFloating} style={floatingStyles} className="z-50">
            <MediaCardModal
              id={id}
              title={title}
              backdrop={posterPath}
              overview={overview}
              releaseDate={releaseDate}
              vote_average={vote_average}
              genre_ids={genre_ids ?? []}
              vote_count={vote_count}
              original_language={original_language}
              runtime={runtime}
              number_of_seasons={number_of_seasons}
              media_type={media_type}
              number_of_episodes={number_of_episodes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
