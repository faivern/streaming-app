import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaStar } from "react-icons/fa";
import Poster from "../../media/shared/Poster";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";

type ListGridCardProps = {
  item: DisplayItem;
  onEdit?: () => void;
  onRemove?: () => void;
  showStatus?: boolean; // Whether to show status badge (only relevant for custom lists)
  forceShowStatus?: boolean; // Mobile toggle override - always show status when true
};

export default function ListGridCard({
  item,
  onEdit,
  onRemove,
  showStatus = false,
  forceShowStatus = false,
}: ListGridCardProps) {
  const avgRating = calculateAverageRating(item);
  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV";
  const hasActions = onEdit || onRemove;

  // Show status in hover overlay (desktop) or always (mobile toggle)
  const shouldShowStatusInOverlay = showStatus && item.status;
  const shouldShowStatusAlways = forceShowStatus && item.status;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50 hover:border-accent-primary/50 transition-all duration-300">
      {/* Clickable poster area */}
      <Link to={`/media/${item.mediaType}/${item.tmdbId}`}>
        <Poster
          path={item.posterPath || undefined}
          alt={item.title}
          className="w-full aspect-[2/3]"
          useCustomSize
        />
      </Link>

      {/* Hover overlay with actions */}
      {hasActions && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-none group-hover:pointer-events-auto">
          {/* Top row: Media type badge + Actions */}
          <div className="flex items-start justify-between">
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-900/80 text-gray-300 rounded">
              {mediaTypeLabel}
            </span>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 text-white/80 hover:text-white bg-gray-900/60 hover:bg-accent-primary rounded-lg transition-colors"
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
                  className="p-2 text-white/80 hover:text-red-400 bg-gray-900/60 hover:bg-red-500/20 rounded-lg transition-colors"
                  aria-label="Remove from list"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom row: Title + Status + Rating */}
          <div>
            <Link
              to={`/media/${item.mediaType}/${item.tmdbId}`}
              className="text-white text-sm font-medium line-clamp-2 hover:text-accent-primary transition-colors"
            >
              {item.title}
            </Link>

            <div className="flex items-center justify-between mt-2">
              {/* Status badge - shown on hover for custom lists */}
              {shouldShowStatusInOverlay && (
                <WatchStatusBadge status={item.status!} size="sm" />
              )}

              {/* Ratings */}
              <div className={`flex items-center gap-2 ${!shouldShowStatusInOverlay ? "ml-auto" : ""}`}>
                {item.voteAverage && (
                  <div className="flex items-center gap-1 text-xs">
                    <FaStar className="text-yellow-400" />
                    <span className="text-gray-300">
                      {item.voteAverage.toFixed(1)}
                    </span>
                  </div>
                )}
                {avgRating !== null && (
                  <div className="flex items-center gap-1 text-xs">
                    <FaStar className="text-accent-primary" />
                    <span className="text-gray-300">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-hover state: Media type badge (only when no hover overlay) */}
      {!hasActions && (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-gray-900/80 text-gray-300 rounded">
          {mediaTypeLabel}
        </span>
      )}

      {/* Bottom info bar */}
      <div className="p-3 bg-gray-800">
        <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
        {/* Status badge - only shown when mobile toggle is active */}
        {shouldShowStatusAlways && (
          <div className="mt-1">
            <WatchStatusBadge status={item.status!} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
