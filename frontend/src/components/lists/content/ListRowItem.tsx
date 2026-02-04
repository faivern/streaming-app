import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaStar } from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import Poster from "../../media/shared/Poster";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import CriteriaRatings from "./CriteriaRatings";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";

type ListRowItemProps = {
  item: DisplayItem;
  isEditMode?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  showStatus?: boolean;
};

const MAX_REVIEW_LENGTH = 150;

export default function ListRowItem({
  item,
  isEditMode = false,
  onEdit,
  onRemove,
  showStatus = true,
}: ListRowItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const avgRating = calculateAverageRating(item);
  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV Show";

  // Check if any individual ratings exist
  const hasRatings =
    item.ratingActing !== null && item.ratingActing !== undefined ||
    item.ratingStory !== null && item.ratingStory !== undefined ||
    item.ratingSoundtrack !== null && item.ratingSoundtrack !== undefined ||
    item.ratingVisuals !== null && item.ratingVisuals !== undefined;

  // Review handling
  const reviewContent = item.review?.content;
  const hasLongReview = reviewContent && reviewContent.length > MAX_REVIEW_LENGTH;
  const displayReview =
    hasLongReview && !isExpanded
      ? reviewContent.slice(0, MAX_REVIEW_LENGTH) + "..."
      : reviewContent;

  return (
    <div className="group flex flex-col gap-2 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
      {/* Main row content */}
      <div className="flex items-center gap-4">
        {/* Poster */}
        <Link
          to={`/media/${item.mediaType}/${item.tmdbId}`}
          className="flex-shrink-0"
        >
          <Poster
            path={item.posterPath || undefined}
            alt={item.title}
            className="w-16 h-24 rounded-lg"
            useCustomSize
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to={`/media/${item.mediaType}/${item.tmdbId}`}
              className="font-medium text-white hover:text-accent-primary transition-colors line-clamp-1"
            >
              {item.title}
            </Link>
            {/* Status badge - icon only, shown on hover (always in layout to prevent jump) */}
            {showStatus && item.status && (
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <WatchStatusBadge status={item.status} variant="icon" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{mediaTypeLabel}</p>

          {/* Ratings row - TMDB and Your average */}
          <div className="flex items-center gap-4 mt-2">
            {item.voteAverage && (
              <div className="flex items-center gap-1 text-sm">
                <FaStar className="text-yellow-400 text-xs" />
                <span className="text-gray-300">
                  {item.voteAverage.toFixed(1)}
                </span>
                <span className="text-gray-500 text-xs">TMDB</span>
              </div>
            )}
            {avgRating !== null && (
              <div className="flex items-center gap-1 text-sm">
                <FaStar className="text-accent-primary text-xs" />
                <span className="text-gray-300">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-xs">Your Rating</span>
              </div>
            )}
          </div>

          {/* Criteria ratings breakdown */}
          {hasRatings && (
            <div className="mt-2">
              <CriteriaRatings
                ratingActing={item.ratingActing}
                ratingStory={item.ratingStory}
                ratingSoundtrack={item.ratingSoundtrack}
                ratingVisuals={item.ratingVisuals}
              />
            </div>
          )}
        </div>

        {/* Edit mode buttons - positioned on far right */}
        {isEditMode && (onRemove || onEdit) && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Edit entry"
              >
                <FaEdit className="text-sm" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Remove from list"
              >
                <FaTrash className="text-sm" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review section - expandable */}
      {reviewContent && (
        <div className="ml-20 pl-4 border-l-2 border-gray-700/50">
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "{displayReview}"
          </p>
          {hasLongReview && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-2 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              {isExpanded ? (
                <>
                  <IoChevronUp className="text-sm" />
                  Show less
                </>
              ) : (
                <>
                  <IoChevronDown className="text-sm" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
