// components/media/cards/MediaSimilarCard.tsx
import { Link } from "react-router-dom";
import type { MediaType } from "../../../types/tmdb";
import { mediaUrl } from "../../../utils/urlBuilder";
import { truncateText } from "../../../utils/truncateText";
import Poster from "../shared/Poster";
import MediaCardModal from "../modals/MediaCardModal";
import { useDelayHover } from "../../../hooks/useDelayHover";

type MediaSimilarCardProps = {
  id: number;
  media_type: MediaType;
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
    genre_ids,
  } = p;

  const { hovered, onEnter, onLeave } = useDelayHover(600);

  const posterForCard = poster_path ?? backdrop_path ?? "";
  const displayTitle = title ?? name ?? "Untitled";
  const titleshort = truncateText(displayTitle);
  const year = (release_date ?? first_air_date ?? "Unknown").slice(0, 4);
  const releaseDate = release_date ?? first_air_date;

  return (
    <div
      className={`group relative transition-transform duration-300 cursor-pointer h-20 ${
        hovered ? "z-(--z-dialog)" : "z-10 hover:z-30"
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link to={mediaUrl(media_type, id, displayTitle)}>
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-action-hover transition-all duration-200 bg-transparent h-full w-full">
          <div className="flex-shrink-0">
            <Poster
              path={posterForCard}
              alt={`Poster for ${displayTitle}`}
              useCustomSize
              className="w-12 h-16 rounded shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
            <h3 className="text-sm font-medium text-white group-hover:text-accent-primary transition-colors truncate leading-tight">
              {titleshort}
            </h3>
            <p className="text-xs text-[var(--subtle)] mt-1 truncate">
              {year}
            </p>
          </div>
        </div>
      </Link>

      {/* Floating hover modal — positioned to the left */}
      {hovered && (
        <div
          className="hidden lg:block absolute top-0 right-full mr-2 animate-[fadeIn_0.15s_ease-out]"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <MediaCardModal
            id={id}
            media_type={media_type}
            title={displayTitle}
            posterPath={posterForCard}
            overview={overview}
            releaseDate={releaseDate}
            vote_average={vote_average}
            genre_ids={genre_ids}
            runtime={p.runtime}
            number_of_seasons={p.number_of_seasons}
            number_of_episodes={p.number_of_episodes}
            compact
          />
        </div>
      )}
    </div>
  );
};

export default MediaSimilarCard;
