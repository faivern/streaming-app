import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaStar } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Poster from "../../media/shared/Poster";
import Backdrop from "../../media/shared/Backdrop";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import CriteriaRatings from "./CriteriaRatings";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";
import { dateFormatYear } from "../../../utils/dateFormatYear";
import useMediaRuntime from "../../../hooks/media/useMediaRuntime";

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
  const runTime = useMediaRuntime({
    mediaType: item.mediaType,
    runtimeMin: item.runtime,
    seasons: item.numberOfSeasons,
    episodes: item.numberOfEpisodes,
  });
  // Check if any individual ratings exist
  const hasRatings =
    (item.ratingActing !== null && item.ratingActing !== undefined) ||
    (item.ratingStory !== null && item.ratingStory !== undefined) ||
    (item.ratingSoundtrack !== null && item.ratingSoundtrack !== undefined) ||
    (item.ratingVisuals !== null && item.ratingVisuals !== undefined);

  // Review handling
  const reviewContent = item.review?.content;

  // Only allow expand when there's something to show
  const hasExpandableContent = !!(
    item.voteAverage ||
    avgRating !== null ||
    hasRatings ||
    reviewContent
  );

  const handleRowClick = () => {
    if (hasExpandableContent) setIsExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex flex-col gap-2 p-3 rounded-xl overflow-hidden shadow-lg border border-[var(--border)]/40 transition-all duration-300
        ${!item.backdropPath ? "bg-[var(--action-primary)]/50 hover:bg-[var(--action-primary)]" : ""}
        ${isEditMode ? "" : "hover:shadow-xl hover:scale-101 hover:border-accent-primary/85"}
        ${hasExpandableContent && !isEditMode ? "cursor-pointer" : ""}`}
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
            onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
            <p className="text-sm text-[var(--subtle)] mt-0.5">
              {[mediaTypeLabel, releaseYear, runTime]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {/* Chevron expand indicator */}
          {hasExpandableContent && (
            <div
              className="flex-shrink-0 text-[var(--subtle)] transition-transform duration-200"
              style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
            >
              <IoChevronDown className="text-sm" />
            </div>
          )}

          {/* Edit mode buttons - always rendered, animated with opacity + width */}
          {(onRemove || onEdit) && (
            <div
              className={`flex-shrink-0 flex items-center gap-2 transition-all duration-300 ease-in-out origin-right ${
                isEditMode
                  ? "opacity-100 max-w-32 scale-100"
                  : "opacity-0 max-w-0 scale-90 overflow-hidden"
              }`}
            >
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

        {/* Expandable content section - animated via CSS Grid */}
        {hasExpandableContent && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-20 pt-2 pb-1 space-y-3">
                {/* TMDB + user average ratings */}
                <div className="flex items-center gap-4">
                  {item.voteAverage && (
                    <div className="flex items-center gap-1 text-sm">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-[var(--subtle)]">
                        {item.voteAverage.toFixed(1)}
                      </span>
                      <span className="text-[var(--subtle)] text-xs">TMDB</span>
                    </div>
                  )}
                  {avgRating !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      <FaStar className="text-accent-primary text-xs" />
                      <span className="text-[var(--subtle)]">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-[var(--subtle)] text-xs">
                        Your average rating
                      </span>
                    </div>
                  )}
                </div>

                {/* Criteria ratings breakdown */}
                {hasRatings && (
                  <div>
                    <CriteriaRatings
                      ratingActing={item.ratingActing}
                      ratingStory={item.ratingStory}
                      ratingSoundtrack={item.ratingSoundtrack}
                      ratingVisuals={item.ratingVisuals}
                    />
                  </div>
                )}

                {/* Review text */}
                {reviewContent && (
                  <div className="pl-4 border-l-2 border-[var(--border)]/50">
                    <p className="text-sm text-[var(--subtle)] leading-relaxed whitespace-pre-line">
                      "{reviewContent}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
