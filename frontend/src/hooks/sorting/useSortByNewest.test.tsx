import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortByNewest } from "./useSortByNewest";
import type { SortableMedia } from "./types";

describe("useSortByNewest", () => {
  it("returns empty array for empty input", () => {
    const { result } = renderHook(() => useSortByNewest([]));
    expect(result.current).toEqual([]);
  });

  it("sorts items by date descending (newest first)", () => {
    const items: SortableMedia[] = [
      { title: "Old", release_date: "2000-01-01" },
      { title: "New", release_date: "2024-01-01" },
      { title: "Mid", release_date: "2010-06-15" },
    ];
    const { result } = renderHook(() => useSortByNewest(items));
    expect(result.current.map((i) => i.title)).toEqual(["New", "Mid", "Old"]);
  });

  it("falls back to first_air_date when release_date is missing", () => {
    const items: SortableMedia[] = [
      { title: "Movie", release_date: "2020-01-01" },
      { title: "Show", first_air_date: "2023-06-01" },
    ];
    const { result } = renderHook(() => useSortByNewest(items));
    expect(result.current[0].title).toBe("Show");
  });

  it("sorts items without dates to the end", () => {
    const items: SortableMedia[] = [
      { title: "NoDate" },
      { title: "HasDate", release_date: "2020-01-01" },
    ];
    const { result } = renderHook(() => useSortByNewest(items));
    expect(result.current.map((i) => i.title)).toEqual([
      "HasDate",
      "NoDate",
    ]);
  });

  it("handles single item", () => {
    const items: SortableMedia[] = [
      { title: "Solo", release_date: "2022-03-15" },
    ];
    const { result } = renderHook(() => useSortByNewest(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Solo");
  });
});
