import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaStar } from "react-icons/fa";
import Poster from "../../media/shared/Poster";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";

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
  const avgRating = calculateAverageRating(item);
  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV Show";

  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/media/${item.mediaType}/${item.tmdbId}`}
              className="font-medium text-white hover:text-accent-primary transition-colors line-clamp-1"
            >
              {item.title}
            </Link>
            <p className="text-sm text-gray-400 mt-0.5">{mediaTypeLabel}</p>
          </div>

          {/* Status badge */}
          {showStatus && item.status && (
            <WatchStatusBadge status={item.status} size="sm" />
          )}
        </div>

        {/* Ratings row */}
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
              <span className="text-gray-500 text-xs">You</span>
            </div>
          )}
        </div>
      </div>

        {/* Edit mode buttons - delete and optionally edit */}
        {isEditMode && (onRemove || onEdit) && (
          <div className="flex flex-row justify-end w-full z-20 gap-4 pb-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-4 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Edit entry"
              >
                <FaEdit className="text-md" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-4 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Remove from list"
              >
                <FaTrash className="text-md" />
              </button>
            )}
          </div>
    
        )}
    </div>
  );
}
