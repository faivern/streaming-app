import { useState } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

type StarRatingProps = {
  value: number | null;
  onChange?: (value: number) => void;
  maxStars?: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
};

export default function StarRating({
  value,
  onChange,
  maxStars = 5,
  maxValue = 10,
  size = "md",
  readOnly = false,
  showValue = true,
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Convert the numeric value (0-maxValue) to star scale (0-maxStars)
  const starValue = value !== null ? (value / maxValue) * maxStars : 0;
  const displayValue = hoverValue !== null ? hoverValue : starValue;

  const sizeClasses = {
    sm: "text-sm gap-0.5",
    md: "text-lg gap-1",
    lg: "text-2xl gap-1",
  };

  const handleClick = (starIndex: number) => {
    if (readOnly || !onChange) return;
    // Convert star index (1-based) to numeric value (0-maxValue)
    const newValue = (starIndex / maxStars) * maxValue;
    onChange(newValue);
  };

  const handleMouseEnter = (starIndex: number) => {
    if (readOnly) return;
    setHoverValue(starIndex);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const renderStar = (index: number) => {
    const starPosition = index + 1;
    const fillAmount = displayValue - index;

    let StarIcon = FaRegStar;
    if (fillAmount >= 1) {
      StarIcon = FaStar;
    } else if (fillAmount >= 0.5) {
      StarIcon = FaStarHalfAlt;
    }

    return (
      <button
        key={index}
        type="button"
        disabled={readOnly}
        onClick={() => handleClick(starPosition)}
        onMouseEnter={() => handleMouseEnter(starPosition)}
        onMouseLeave={handleMouseLeave}
        className={`text-yellow-400 transition-transform ${
          !readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"
        }`}
        aria-label={`Rate ${starPosition} out of ${maxStars} stars`}
      >
        <StarIcon />
      </button>
    );
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </div>
      {showValue && value !== null && (
        <span className="ml-2 text-gray-400 text-sm font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
