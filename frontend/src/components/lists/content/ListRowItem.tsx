import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaStar } from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import Poster from "../../media/shared/Poster";
import Backdrop from "../../media/shared/Backdrop";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import CriteriaRatings from "./CriteriaRatings";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";
import { dateFormatYear } from "../../../utils/dateFormatYear";


type ListRowItemProps = {
  item: DisplayItem;
  isEditMode?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  showStatus?: boolean;
};

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
  const releaseYear = dateFormatYear(item.releaseDate || item.firstAirDate);
  const runTime = item.runtime
    ? `${item.runtime} min`
    : item.numberOfSeasons
    ? `${item.numberOfSeasons} season${item.numberOfSeasons > 1 ? "s" : ""}`
    : null;

  // Check if any individual ratings exist
  const hasRatings =
    item.ratingActing !== null && item.ratingActing !== undefined ||
    item.ratingStory !== null && item.ratingStory !== undefined ||
    item.ratingSoundtrack !== null && item.ratingSoundtrack !== undefined ||
    item.ratingVisuals !== null && item.ratingVisuals !== undefined;

  // Review handling
  const reviewContent = item.review?.content;

  return (
    <div
      className={`group relative flex flex-col gap-2 p-3 rounded-xl overflow-hidden border border-gray-400/10 ${!item.backdropPath ? "bg-gray-800/50 hover:bg-gray-800" : ""} transition-colors hover:shadow-xl hover:scale-102 hover:border-accent-primary/75 transition-all duration-300 relative group transition-transform duration-300 cursor-pointer`}
    >
      {/* Blurred backdrop background */}
      {item.backdropPath && (
        <>
          <Backdrop
            path={item.backdropPath}
            alt=""
            className="absolute inset-0 w-full h-full blur-sm opacity-20"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}

      {/* Content layer */}
      <div className="relative z-10 flex flex-col gap-2">
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
            <p className="text-sm text-gray-400 mt-0.5">
              {[mediaTypeLabel, releaseYear, runTime]
                .filter(Boolean)
                .join(" · ")}
            </p>

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
                  <span className="text-gray-500 text-xs">
                    Your average rating
                  </span>
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

        {/* Review section - collapsed by default */}
        {reviewContent && (
          <div className="ml-20">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {isExpanded ? (
                <>
                  <IoChevronUp className="text-sm" />
                  Collapse review
                </>
              ) : (
                <>
                  <IoChevronDown className="text-sm" />
                  Expand review
                </>
              )}
            </button>
            {isExpanded && (
              <div className="mt-2 pl-4 border-l-2 border-gray-700/50">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  "{reviewContent}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
