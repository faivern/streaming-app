import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Poster from "../../media/shared/Poster";
import Backdrop from "../../media/shared/Backdrop";
import CriteriaRatings from "./CriteriaRatings";
import useLongPress from "../../../hooks/interaction/useLongPress";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";
import { dateFormatYear } from "../../../utils/dateFormatYear";

type MobileListRowItemProps = {
  item: DisplayItem;
  onContextMenu?: (item: DisplayItem) => void;
};

export default function MobileListRowItem({
  item,
  onContextMenu,
}: MobileListRowItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV";
  const releaseYear = dateFormatYear(item.releaseDate || item.firstAirDate);
  const avgRating = calculateAverageRating(item);

  const longPressHandlers = useLongPress({
    onLongPress: () => onContextMenu?.(item),
  });

  // Check if any individual ratings exist
  const hasRatings =
    (item.ratingActing !== null && item.ratingActing !== undefined) ||
    (item.ratingStory !== null && item.ratingStory !== undefined) ||
    (item.ratingSoundtrack !== null && item.ratingSoundtrack !== undefined) ||
    (item.ratingVisuals !== null && item.ratingVisuals !== undefined);

  const reviewContent = item.review?.content;

  const hasExpandableContent = !!(
    item.voteAverage ||
    avgRating !== null ||
    hasRatings ||
    reviewContent
  );

  // Build subtitle: "Movie · 2024" or "TV · 3 Seasons"
  const subtitleParts: string[] = [mediaTypeLabel];
  if (item.mediaType === "tv" && item.numberOfSeasons) {
    subtitleParts.push(
      `${item.numberOfSeasons} Season${item.numberOfSeasons > 1 ? "s" : ""}`,
    );
  } else if (releaseYear) {
    subtitleParts.push(String(releaseYear));
  }

  const handleRowClick = () => {
    if (hasExpandableContent) setIsExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`relative flex flex-col overflow-hidden rounded-xl shadow-lg border border-[var(--border)]/40 bg-[var(--card-bg,var(--background))]
        ${hasExpandableContent ? "cursor-pointer" : ""}`}
      {...longPressHandlers}
    >
      {/* Backdrop image + overlay */}
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
      <div className="relative z-10 flex flex-col">
        {/* Main row content */}
        <div className="flex items-center gap-3 w-full p-3">
          {/* Poster — navigates to detail page */}
          <Link
            to={`/media/${item.mediaType}/${item.tmdbId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <Poster
              path={item.posterPath || undefined}
              alt={item.title}
              className="w-12 h-[72px] rounded-md"
              useCustomSize
            />
          </Link>

          {/* Text content — tapping expands the row */}
          <div className="flex-1 min-w-0 py-1">
            <p className="font-medium text-white line-clamp-1 text-sm">
              {item.title}
            </p>
            <p className="text-xs text-[var(--subtle)] mt-0.5">
              {subtitleParts.join(" · ")}
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

          {/* Overflow button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onContextMenu?.(item);
            }}
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-[var(--subtle)] hover:text-white hover:bg-[var(--action-primary)] transition-colors"
            aria-label={`More options for ${item.title}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Expandable content section — animated via CSS Grid */}
        {hasExpandableContent && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-3 pb-3 pt-1 ml-15 space-y-3">
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
                  <CriteriaRatings
                    ratingActing={item.ratingActing}
                    ratingStory={item.ratingStory}
                    ratingSoundtrack={item.ratingSoundtrack}
                    ratingVisuals={item.ratingVisuals}
                  />
                )}

                {/* Review text */}
                {reviewContent && (
                  <div className="pl-3 border-l-2 border-[var(--border)]/50">
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
