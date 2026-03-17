import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortByBayesian } from "./useSortByBayesian";
import type { SortableMedia } from "./types";

describe("useSortByBayesian", () => {
  it("returns empty array for empty input", () => {
    const { result } = renderHook(() => useSortByBayesian([]));
    expect(result.current).toEqual([]);
  });

  it("returns copy when no items have ratings", () => {
    const items: SortableMedia[] = [
      { title: "A" },
      { title: "B" },
    ];
    const { result } = renderHook(() => useSortByBayesian(items));
    expect(result.current).toEqual(items);
    expect(result.current).not.toBe(items);
  });

  it("ranks higher vote_count items higher when ratings differ slightly", () => {
    // With m=5000, high vote_count items stay closer to their raw rating
    // while low vote_count items get pulled toward the mean
    const items: SortableMedia[] = [
      { title: "Few", vote_average: 8.5, vote_count: 100 },
      { title: "Many", vote_average: 8.0, vote_count: 50000 },
      { title: "Baseline", vote_average: 5.0, vote_count: 10000 },
    ];
    const { result } = renderHook(() => useSortByBayesian(items));
    // Many (50000 votes) keeps close to 8.0; Few (100 votes) gets pulled toward mean (~7.17)
    expect(result.current[0].title).toBe("Many");
  });

  it("respects m=5000 threshold pulling low vote_count toward mean", () => {
    // With m=5000, an item with only 10 votes should be heavily pulled toward the mean
    const items: SortableMedia[] = [
      { title: "Popular", vote_average: 7.5, vote_count: 20000 },
      { title: "Niche", vote_average: 9.5, vote_count: 10 },
      { title: "Average", vote_average: 5.0, vote_count: 15000 },
      { title: "Low", vote_average: 4.0, vote_count: 10000 },
    ];
    const { result } = renderHook(() => useSortByBayesian(items));
    // Popular has high votes so stays near 7.5; Niche has 10 votes so
    // gets pulled heavily toward mean (~6.5), landing well below Popular
    expect(result.current[0].title).toBe("Popular");
  });

  it("items with 0 votes get WR=0", () => {
    const items: SortableMedia[] = [
      { title: "NoVotes", vote_average: 10, vote_count: 0 },
      { title: "HasVotes", vote_average: 5, vote_count: 6000 },
    ];
    const { result } = renderHook(() => useSortByBayesian(items));
    expect(result.current[0].title).toBe("HasVotes");
  });

  it("handles single item with ratings", () => {
    const items: SortableMedia[] = [
      { title: "Solo", vote_average: 8.5, vote_count: 10000 },
    ];
    const { result } = renderHook(() => useSortByBayesian(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe("Solo");
  });
});
