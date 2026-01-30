import "../../../style/MediaCard.css";

import { Link } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import Poster from "../../media/shared/Poster";
import WatchStatusBadge from "../shared/WatchStatusBadge";
import type { DisplayItem } from "../../../types/lists.view";
import { calculateAverageRating } from "../../../types/lists.view";
import RatingPillUser from "../../ui/RatingPillUser";

type ListMediaCardProps = {
  item: DisplayItem;
  isEditMode?: boolean; // When true, show delete/edit buttons
  onRemove?: () => void; // Called when delete button clicked
  onEdit?: () => void; // Called when edit button clicked (for media entries)
  showStatus?: boolean; // Show status badge on hover
};

export default function ListMediaCard({
  item,
  isEditMode = false,
  onRemove,
  onEdit,
  showStatus = false,
}: ListMediaCardProps) {
  const shouldShowStatusBadge = showStatus && item.status;
const avgRating = calculateAverageRating(item);
  // Conditional classes: disable scale/z-index hover effects in edit mode
  const containerClass = isEditMode
    ? "group relative z-10 transition-transform duration-300"
    : "group relative z-10 hover:z-30 transition-transform duration-300";

  const cardClass = isEditMode
    ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg hover:shadow-xl hover:border-accent-primary/75 transition-all duration-300 relative"
    : "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 hover:border-accent-primary/75 transition-all duration-300 relative";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <Link to={`/media/${item.mediaType}/${item.tmdbId}`}>
          {/* Shine overlay effect */}
          <div className="shine-overlay" />

          <RatingPillUser
            rating={avgRating || 0}
            className="absolute top-1 right-1 text-accent-primary bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl"
            showOutOfTen={false}
          />

          {/* Poster */}
          <Poster
            path={item.posterPath || undefined}
            alt={item.title}
            className="w-full"
          />

          {/* Content - Title area */}
          <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-md font-semibold text-white truncate">
              {item.title.length > 35
                ? `${item.title.slice(0, 35)}...`
                : item.title}
            </h3>
          </div>
        </Link>

        {/* Edit mode buttons - delete and optionally edit */}
        {isEditMode && (onRemove || onEdit) && (
          <div className="absolute top-2 right-2 z-20 flex gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
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
                className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Remove from list"
              >
                <FaTrash className="text-sm" />
              </button>
            )}
          </div>
        )}

        {/* Status badge */}
        {shouldShowStatusBadge && (
          <div className="flex justify-center absolute top-2 right-0 left-0 z-20 hidden group-hover:flex">
            <WatchStatusBadge status={item.status!} size="md" />
          </div>
        )}
      </div>
    </div>
  );
}
