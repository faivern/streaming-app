import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortChronological } from "./useSortChronological";
import { useSortByOldest } from "./useSortByOldest";
import type { SortableMedia } from "./types";

describe("useSortChronological", () => {
  it("sorts items ascending (chronological order)", () => {
    const items: SortableMedia[] = [
      { title: "New", release_date: "2024-01-01" },
      { title: "Old", release_date: "2000-01-01" },
      { title: "Mid", release_date: "2010-06-15" },
    ];
    const { result } = renderHook(() => useSortChronological(items));
    expect(result.current.map((i) => i.title)).toEqual(["Old", "Mid", "New"]);
  });

  it("produces same result as useSortByOldest", () => {
    const items: SortableMedia[] = [
      { title: "C", release_date: "2023-01-01" },
      { title: "A", release_date: "2001-05-10" },
      { title: "B", first_air_date: "2015-08-20" },
      { title: "D" },
    ];
    const { result: chronological } = renderHook(() =>
      useSortChronological(items)
    );
    const { result: oldest } = renderHook(() => useSortByOldest(items));
    expect(chronological.current).toEqual(oldest.current);
  });
});
