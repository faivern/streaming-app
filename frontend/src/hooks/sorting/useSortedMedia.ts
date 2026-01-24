import { useMemo } from "react";
import type { SortableMedia, SortOption } from "./types";

export function useSortedMedia<T extends SortableMedia>(
  items: T[] | undefined,
  sortOption: SortOption
): T[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    switch (sortOption) {
      case "bayesian":
        return sortByBayesian(items);
      case "newest":
        return sortByDate(items, "desc");
      case "oldest":
        return sortByDate(items, "asc");
      case "a-z":
        return sortByTitle(items, "asc");
      case "z-a":
        return sortByTitle(items, "desc");
      default:
        return [...items];
    }
  }, [items, sortOption]);
}

function sortByBayesian<T extends SortableMedia>(items: T[]): T[] {
  // Calculate mean rating (C) across all items with votes
  const itemsWithRatings = items.filter(
    (item) =>
      typeof item.vote_average === "number" &&
      typeof item.vote_count === "number" &&
      item.vote_count > 0
  );

  if (itemsWithRatings.length === 0) return [...items];

  const C =
    itemsWithRatings.reduce((sum, item) => sum + (item.vote_average || 0), 0) /
    itemsWithRatings.length;

  // Minimum votes threshold (m)
  const m = 10;

  // Calculate weighted rating for each item
  const withWeightedRating = items.map((item) => {
    const v = item.vote_count || 0;
    const R = item.vote_average || 0;

    // Bayesian weighted rating: WR = (v/(v+m)) × R + (m/(v+m)) × C
    const WR = v > 0 ? (v / (v + m)) * R + (m / (v + m)) * C : 0;

    return { item, WR };
  });

  // Sort by weighted rating descending
  return withWeightedRating.sort((a, b) => b.WR - a.WR).map(({ item }) => item);
}

function sortByDate<T extends SortableMedia>(
  items: T[],
  direction: "asc" | "desc"
): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";

    // Items without dates go to the end
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const comparison = dateA.localeCompare(dateB);
    return direction === "asc" ? comparison : -comparison;
  });
}

function sortByTitle<T extends SortableMedia>(
  items: T[],
  direction: "asc" | "desc"
): T[] {
  return [...items].sort((a, b) => {
    const titleA = (a.title || a.name || "").toLowerCase();
    const titleB = (b.title || b.name || "").toLowerCase();

    // Items without titles go to the end
    if (!titleA && !titleB) return 0;
    if (!titleA) return 1;
    if (!titleB) return -1;

    const comparison = titleA.localeCompare(titleB);
    return direction === "asc" ? comparison : -comparison;
  });
}
