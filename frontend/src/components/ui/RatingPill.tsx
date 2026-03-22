// components/ui/RatingPill.tsx
import Pill from "./Pill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  rating?: number;
  count?: number;
  className?: string;
  showOutOfTen?: boolean;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  showWhenEmpty?: boolean;
};

export default function RatingPill({
  rating,
  count,
  className = "",
  showOutOfTen = true,
  tmdbId,
  mediaType,
  showWhenEmpty = false,
}: Props) {
  const hasRating = rating != null && rating > 0;
  const hasLink = tmdbId != null && mediaType != null;
  const visibilityClass = !hasRating && !showWhenEmpty ? "invisible" : "";

  const content = (
    <Pill
      className={`font-medium ${hasLink && hasRating ? "hover:bg-amber-500/20 transition-colors cursor-pointer" : ""} ${visibilityClass} ${className}`}
      icon={
        <FontAwesomeIcon
          icon={faStar}
          className={hasRating ? "text-amber-400 mr-1" : "text-gray-500 mr-1"}
        />
      }
      title={
        !hasRating
          ? "No rating available yet"
          : hasLink
          ? "View on TMDB"
          : "Average TMDB rating"
      }
    >
      {hasRating ? (
        <>
          <span className="font-bold">{rating.toFixed(1)}</span>
          {showOutOfTen && <span>/10</span>}
          {count != null && (
            <span className="ml-1 text-xs text-gray-400">
              ({count.toLocaleString()})
            </span>
          )}
        </>
      ) : (
        <span className="text-gray-500">—</span>
      )}
    </Pill>
  );

  if (hasLink) {
    return (
      <a
        href={`https://www.themoviedb.org/${mediaType}/${tmdbId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline"
      >
        {content}
      </a>
    );
  }

  return content;
}
