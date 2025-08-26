// components/ui/RatingPill.tsx
import Pill from "./Pill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  rating?: number;
  count?: number;
  className?: string;
  showOutOfTen?: boolean; // NEW prop
};

export default function RatingPill({
  rating,
  count,
  className = "",
  showOutOfTen = true,
}: Props) {
  return (
    <Pill
      className={`font-medium ${className}`}
      icon={<FontAwesomeIcon icon={faStar} className="text-amber-400 mr-1" />}
      title="Average rating"
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
}
