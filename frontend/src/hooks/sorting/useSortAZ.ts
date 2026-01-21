import { useMemo } from "react";
import type { SortableMedia } from "./types";

export function useSortAZ<T extends SortableMedia>(items: T[]): T[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    return [...items].sort((a, b) => {
      const titleA = (a.title || a.name || "").toLowerCase();
      const titleB = (b.title || b.name || "").toLowerCase();

      // Items without titles go to the end
      if (!titleA && !titleB) return 0;
      if (!titleA) return 1;
      if (!titleB) return -1;

      // Sort ascending (A-Z)
      return titleA.localeCompare(titleB);
    });
  }, [items]);
}
