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
      <span key={index} className={`text-accent-primary`}>
        <StarIcon />
      </span>
    );
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className={`flex items-center ${sizeClasses[size]}`}>
        <div className="flex">
          {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
        </div>
        {showValue && value !== null && (
          <span className="ml-2 text-gray-400 text-sm font-medium">
            {value.toFixed(1)}
          </span>
        )}
      </div>
      {!readOnly && (
        <input
          type="range"
          min={0}
          max={maxValue}
          step={0.1}
          value={value ?? 0}
          onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
          className="w-full accent-accent-primary h-1 mt-1"
        />
      )}
    </div>
  );
}
