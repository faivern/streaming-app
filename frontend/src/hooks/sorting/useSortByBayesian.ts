import { useMemo } from "react";
import type { SortableMedia } from "./types";

export function useSortByBayesian<T extends SortableMedia>(items: T[]): T[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    // Calculate mean rating (C) across all items with votes
    const itemsWithRatings = items.filter(
      (item) =>
        typeof item.vote_average === "number" &&
        typeof item.vote_count === "number" &&
        item.vote_count > 0,
    );

    if (itemsWithRatings.length === 0) return [...items];

    const C =
      itemsWithRatings.reduce(
        (sum, item) => sum + (item.vote_average || 0),
        0,
      ) / itemsWithRatings.length;

    // Minimum votes threshold (m)
    const m = 5000;

    // Calculate weighted rating for each item
    const withWeightedRating = items.map((item) => {
      const v = item.vote_count || 0;
      const R = item.vote_average || 0;

      // Bayesian weighted rating: WR = (v/(v+m)) × R + (m/(v+m)) × C
      const WR = v > 0 ? (v / (v + m)) * R + (m / (v + m)) * C : 0;

      return { item, WR };
    });

    // Sort by weighted rating descending
    return withWeightedRating
      .sort((a, b) => b.WR - a.WR)
      .map(({ item }) => item);
  }, [items]);
}
