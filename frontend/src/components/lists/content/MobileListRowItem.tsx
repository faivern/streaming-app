import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import Poster from "../../media/shared/Poster";
import Backdrop from "../../media/shared/Backdrop";
import useLongPress from "../../../hooks/interaction/useLongPress";
import type { DisplayItem } from "../../../types/lists.view";
import { dateFormatYear } from "../../../utils/dateFormatYear";

type MobileListRowItemProps = {
  item: DisplayItem;
  onContextMenu?: (item: DisplayItem) => void;
};

export default function MobileListRowItem({
  item,
  onContextMenu,
}: MobileListRowItemProps) {
  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV";
  const releaseYear = dateFormatYear(item.releaseDate || item.firstAirDate);

  const longPressHandlers = useLongPress({
    onLongPress: () => onContextMenu?.(item),
  });

  // Build subtitle: "Movie · 2024" or "TV · 3 Seasons"
  const subtitleParts: string[] = [mediaTypeLabel];
  if (item.mediaType === "tv" && item.numberOfSeasons) {
    subtitleParts.push(
      `${item.numberOfSeasons} Season${item.numberOfSeasons > 1 ? "s" : ""}`,
    );
  } else if (releaseYear) {
    subtitleParts.push(String(releaseYear));
  }

  return (
    <div
      className="relative flex items-center overflow-hidden rounded-xl shadow-lg border border-[var(--border)]/40 bg-[var(--card-bg,var(--background))]"
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
      <div className="relative z-10 flex items-center gap-3 w-full p-3">
        {/* Poster */}
        <Link
          to={`/media/${item.mediaType}/${item.tmdbId}`}
          className="flex-shrink-0"
        >
          <Poster
            path={item.posterPath || undefined}
            alt={item.title}
            className="w-12 h-[72px] rounded-md"
            useCustomSize
          />
        </Link>

        {/* Text content — tapping navigates */}
        <Link
          to={`/media/${item.mediaType}/${item.tmdbId}`}
          className="flex-1 min-w-0 py-1"
        >
          <p className="font-medium text-white line-clamp-1 text-sm">
            {item.title}
          </p>
          <p className="text-xs text-[var(--subtle)] mt-0.5">
            {subtitleParts.join(" · ")}
          </p>
        </Link>

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
    </div>
  );
}
