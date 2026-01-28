import { useMemo } from "react";
import type { DisplayItem, ListsSortOption } from "../../types/lists.view";
import { calculateAverageRating } from "../../types/lists.view";

/**
 * Sort display items by various criteria specific to user lists
 */
export function useListsSorting(
  items: DisplayItem[] | undefined,
  sortOption: ListsSortOption
): DisplayItem[] {
  return useMemo(() => {
    if (!items) return [];

    const sorted = [...items];

    switch (sortOption) {
      case "date-added":
        // Most recently added first
        sorted.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;

      case "your-rating":
        // Highest rated first, unrated items at the end
        sorted.sort((a, b) => {
          const ratingA = calculateAverageRating(a);
          const ratingB = calculateAverageRating(b);

          // Both have ratings - sort by rating descending
          if (ratingA !== null && ratingB !== null) {
            return ratingB - ratingA;
          }
          // Only A has rating - A comes first
          if (ratingA !== null) return -1;
          // Only B has rating - B comes first
          if (ratingB !== null) return 1;
          // Neither has rating - maintain order
          return 0;
        });
        break;

      case "title-asc":
        sorted.sort((a, b) =>
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
        break;

      case "title-desc":
        sorted.sort((a, b) =>
          b.title.toLowerCase().localeCompare(a.title.toLowerCase())
        );
        break;

      case "newest":
        // Sort by TMDB release date (newest first) - we'd need release_date
        // For now, fall back to addedAt
        sorted.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;

      case "oldest":
        // Sort by TMDB release date (oldest first)
        sorted.sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        );
        break;

      default:
        break;
    }

    return sorted;
  }, [items, sortOption]);
}

export const LISTS_SORT_OPTIONS: { value: ListsSortOption; label: string }[] = [
  { value: "date-added", label: "Date Added" },
  { value: "your-rating", label: "Your Rating" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
];
