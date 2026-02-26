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
    ? "bg-[var(--component-primary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg hover:shadow-xl hover:border-accent-primary/75 transition-all duration-300 relative"
    : "bg-[var(--component-primary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 hover:border-accent-primary/75 transition-all duration-300 relative";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <Link to={`/media/${item.mediaType}/${item.tmdbId}`}>
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
            <h3 className="text-md font-semibold text-[var(--text-h1)] truncate">
              {item.title.length > 35
                ? `${item.title.slice(0, 35)}...`
                : item.title}
            </h3>
          </div>
        </Link>

        {/* Edit mode buttons - always rendered, animated via CSS grid */}
        {(onRemove || onEdit) && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isEditMode ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`flex flex-row justify-center items-center w-full z-20 gap-4 pb-4 transition-opacity duration-300 ease-in-out ${
                  isEditMode ? "opacity-100" : "opacity-0"
                }`}
              >
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
            </div>
          </div>
        )}

        {/* Status badge - icon only, top-left corner */}
        {shouldShowStatusBadge && (
          <div className="absolute top-2 left-2 z-20 hidden group-hover:flex">
            <WatchStatusBadge status={item.status!} variant="icon" />
          </div>
        )}
      </div>
    </div>
  );
}
