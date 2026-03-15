import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortZA } from "./useSortZA";
import type { SortableMedia } from "./types";

describe("useSortZA", () => {
  it("returns empty array for empty input", () => {
    const { result } = renderHook(() => useSortZA([]));
    expect(result.current).toEqual([]);
  });

  it("sorts items Z-A by title", () => {
    const items: SortableMedia[] = [
      { title: "Alpha" },
      { title: "Zorro" },
      { title: "Middle" },
    ];
    const { result } = renderHook(() => useSortZA(items));
    expect(result.current.map((i) => i.title)).toEqual([
      "Zorro",
      "Middle",
      "Alpha",
    ]);
  });

  it("falls back to name when title is missing", () => {
    const items: SortableMedia[] = [
      { title: "Apple" },
      { name: "Zebra" },
    ];
    const { result } = renderHook(() => useSortZA(items));
    expect(result.current.map((i) => i.title || i.name)).toEqual([
      "Zebra",
      "Apple",
    ]);
  });

  it("sorts items without titles to the end", () => {
    const items: SortableMedia[] = [
      { title: "Alpha" },
      { title: "" },
      { title: "Beta" },
    ];
    const { result } = renderHook(() => useSortZA(items));
    expect(result.current.map((i) => i.title)).toEqual([
      "Beta",
      "Alpha",
      "",
    ]);
  });

  it("handles single item", () => {
    const items: SortableMedia[] = [{ title: "Solo" }];
    const { result } = renderHook(() => useSortZA(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Solo");
  });
});
