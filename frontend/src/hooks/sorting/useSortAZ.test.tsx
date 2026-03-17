import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortAZ } from "./useSortAZ";
import type { SortableMedia } from "./types";

describe("useSortAZ", () => {
  it("returns empty array for empty input", () => {
    const { result } = renderHook(() => useSortAZ([]));
    expect(result.current).toEqual([]);
  });

  it("sorts items A-Z by title", () => {
    const items: SortableMedia[] = [
      { title: "Zorro" },
      { title: "Alpha" },
      { title: "Middle" },
    ];
    const { result } = renderHook(() => useSortAZ(items));
    expect(result.current.map((i) => i.title)).toEqual([
      "Alpha",
      "Middle",
      "Zorro",
    ]);
  });

  it("falls back to name when title is missing", () => {
    const items: SortableMedia[] = [
      { name: "Zebra" },
      { title: "Apple" },
    ];
    const { result } = renderHook(() => useSortAZ(items));
    expect(result.current.map((i) => i.title || i.name)).toEqual([
      "Apple",
      "Zebra",
    ]);
  });

  it("sorts items without titles to the end", () => {
    const items: SortableMedia[] = [
      { title: "" },
      { title: "Beta" },
      { title: "Alpha" },
    ];
    const { result } = renderHook(() => useSortAZ(items));
    expect(result.current.map((i) => i.title)).toEqual([
      "Alpha",
      "Beta",
      "",
    ]);
  });

  it("handles single item", () => {
    const items: SortableMedia[] = [{ title: "Solo" }];
    const { result } = renderHook(() => useSortAZ(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Solo");
  });
});
