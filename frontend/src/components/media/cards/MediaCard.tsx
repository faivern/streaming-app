import "../../../style/MediaCard.css";

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
  } = props;

  const hoverDelay = 600;
  const { hovered, onEnter, onLeave, setHovered } = useDelayHover(hoverDelay);

  const { refs, floatingStyles } = useFloating({
    placement: "right",
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div
      ref={refs.setReference}
      className="relative w-full mx-auto"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={() => setHovered(true)}   // keep instant for keyboard a11y
      onBlur={() => setHovered(false)}
    >
      <div className="group relative z-10 hover:z-30 transition-transform duration-300 cursor-pointer"></div>

      <div className="group relative z-10 hover:z-30 transition-transform duration-300 cursor-pointer">
        <div
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
  rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
  hover:shadow-xl hover:scale-105 hover:border-accent-primary/75 transition-all duration-300 relative group"
        >
          <Link to={`/media/${media_type}/${id}`}>
            {/* Shine layer */}
            <div className="shine-overlay" />

            <RatingPill
              rating={vote_average}
              className="absolute top-1 right-1 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl"
              showOutOfTen={false}
            />

            {/* Poster */}
            <Poster 
              path={posterPath} 
              alt={title} 
              className="w-full" 
              priority={true} 
            />

            {/* Content */}
            <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-md font-semibold text-white truncate">
                {title.length > 35 ? `${title.slice(0, 35)}...` : title}
              </h3>
            </div>
          </Link>
        </div>
        {/* 🟡 Simple test modal */}
        {hovered && (
          <div ref={refs.setFloating} style={floatingStyles} className="z-50">
            
            <MediaCardModal
              id={id}
              title={title}
              backdrop={posterPath}
              overview={overview}
              releaseDate={releaseDate}
              vote_average={vote_average}
              genre_ids={genre_ids ?? []} // Pass genre_ids from props, fallback to empty array
              vote_count={vote_count} // Pass vote_count from props
              original_language={original_language} // Pass original_language from props
              runtime={runtime} // Pass runtime from props
              number_of_seasons={number_of_seasons} // Pass season_number from props
              media_type={media_type} // Pass media_type from props
              number_of_episodes={number_of_episodes} // Pass number_of_episodes from props
            />
          </div>
        )}
      </div>
    </div>
  );
}
