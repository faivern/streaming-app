import { useMemo } from "react";
import type { SortableMedia } from "./types";

export function useSortByNewest<T extends SortableMedia>(items: T[]): T[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    return [...items].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";

      // Items without dates go to the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      // Sort descending (newest first)
      return dateB.localeCompare(dateA);
    });
  }, [items]);
}
