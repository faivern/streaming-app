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
};

export default function RatingPill({
  rating,
  count,
  className = "",
  showOutOfTen = true,
  imdbId,
}: Props) {
  const content = (
    <Pill
      className={`font-medium ${imdbId ? "hover:bg-amber-500/20 transition-colors cursor-pointer" : ""} ${className}`}
      icon={<FontAwesomeIcon icon={faStar} className="text-amber-400 mr-1" />}
      title={imdbId ? "View on IMDB" : "Average rating"}
    >
      {rating ? (
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
        "No rating"
      )}
    </Pill>
  );

  if (imdbId) {
    return (
      <a
        href={`https://www.imdb.com/title/${imdbId}`}
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
