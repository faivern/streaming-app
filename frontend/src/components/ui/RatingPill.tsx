// components/ui/RatingPill.tsx
import Pill from "./Pill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  rating?: number;
  count?: number;
  className?: string;
  showOutOfTen?: boolean;
  imdbId?: string;
  showWhenEmpty?: boolean;
};

export default function RatingPill({
  rating,
  count,
  className = "",
  showOutOfTen = true,
  imdbId,
  showWhenEmpty = false,
}: Props) {
  const hasRating = rating != null && rating > 0;
  const visibilityClass = !hasRating && !showWhenEmpty ? "invisible" : "";

  const content = (
    <Pill
      className={`font-medium ${imdbId && hasRating ? "hover:bg-amber-500/20 transition-colors cursor-pointer" : ""} ${visibilityClass} ${className}`}
      icon={
        <FontAwesomeIcon
          icon={faStar}
          className={hasRating ? "text-amber-400 mr-1" : "text-gray-500 mr-1"}
        />
      }
      title={
        !hasRating
          ? "No rating available yet"
          : imdbId
          ? "View on IMDB"
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

  if (imdbId) {
    return (
      <a
        href={`https://www.imdb.com/title/${imdbId}/ratings/?ref_=tt_ov_rat`}
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
