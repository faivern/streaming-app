import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useListsSorting, LISTS_SORT_OPTIONS } from "./useListsSorting";
import type { DisplayItem } from "../../types/lists.view";

function makeItem(overrides: Partial<DisplayItem>): DisplayItem {
  return {
    id: 1,
    tmdbId: 100,
    mediaType: "movie",
    title: "Test",
    posterPath: null,
    addedAt: "2024-01-01T00:00:00Z",
    source: "list",
    sourceId: 1,
    ...overrides,
  };
}

describe("useListsSorting", () => {
  it("sorts by date-added descending", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "Old", addedAt: "2023-01-01T00:00:00Z" }),
      makeItem({ id: 2, title: "New", addedAt: "2024-06-01T00:00:00Z" }),
      makeItem({ id: 3, title: "Mid", addedAt: "2023-06-01T00:00:00Z" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "date-added"));
    expect(result.current.map((i) => i.title)).toEqual(["New", "Mid", "Old"]);
  });

  it("sorts by title-asc (A-Z)", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "Zorro" }),
      makeItem({ id: 2, title: "Alpha" }),
      makeItem({ id: 3, title: "Middle" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "title-asc"));
    expect(result.current.map((i) => i.title)).toEqual([
      "Alpha",
      "Middle",
      "Zorro",
    ]);
  });

  it("sorts by title-desc (Z-A)", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "Alpha" }),
      makeItem({ id: 2, title: "Zorro" }),
      makeItem({ id: 3, title: "Middle" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "title-desc"));
    expect(result.current.map((i) => i.title)).toEqual([
      "Zorro",
      "Middle",
      "Alpha",
    ]);
  });

  it("sorts by newest (addedAt descending, same as date-added)", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "Old", addedAt: "2023-01-01T00:00:00Z" }),
      makeItem({ id: 2, title: "New", addedAt: "2024-06-01T00:00:00Z" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "newest"));
    expect(result.current.map((i) => i.title)).toEqual(["New", "Old"]);
  });

  it("sorts by oldest (addedAt ascending)", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "New", addedAt: "2024-06-01T00:00:00Z" }),
      makeItem({ id: 2, title: "Old", addedAt: "2023-01-01T00:00:00Z" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "oldest"));
    expect(result.current.map((i) => i.title)).toEqual(["Old", "New"]);
  });

  it("sorts by your-rating with rated items first, highest rating first", () => {
    const items: DisplayItem[] = [
      makeItem({
        id: 1,
        title: "Low",
        ratingActing: 3,
        ratingStory: 3,
        ratingSoundtrack: 3,
        ratingVisuals: 3,
      }),
      makeItem({
        id: 2,
        title: "High",
        ratingActing: 9,
        ratingStory: 9,
        ratingSoundtrack: 9,
        ratingVisuals: 9,
      }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "your-rating"));
    expect(result.current.map((i) => i.title)).toEqual(["High", "Low"]);
  });

  it("sorts unrated items to end for your-rating", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "Unrated" }),
      makeItem({
        id: 2,
        title: "Rated",
        ratingActing: 7,
        ratingStory: 7,
        ratingSoundtrack: 7,
        ratingVisuals: 7,
      }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "your-rating"));
    expect(result.current.map((i) => i.title)).toEqual(["Rated", "Unrated"]);
  });

  it("returns empty array for undefined items", () => {
    const { result } = renderHook(() =>
      useListsSorting(undefined, "date-added")
    );
    expect(result.current).toEqual([]);
  });

  it("LISTS_SORT_OPTIONS has correct values", () => {
    const values = LISTS_SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("date-added");
    expect(values).toContain("your-rating");
    expect(values).toContain("title-asc");
    expect(values).toContain("title-desc");
  });

  it("LISTS_SORT_OPTIONS has 4 entries", () => {
    expect(LISTS_SORT_OPTIONS).toHaveLength(4);
  });

  it("default sort returns copy of items", () => {
    const items: DisplayItem[] = [
      makeItem({ id: 1, title: "A" }),
      makeItem({ id: 2, title: "B" }),
    ];
    const { result } = renderHook(() =>
      useListsSorting(items, "unknown" as never)
    );
    expect(result.current).toEqual(items);
    expect(result.current).not.toBe(items);
  });

  it("your-rating works with partial ratings", () => {
    const items: DisplayItem[] = [
      makeItem({
        id: 1,
        title: "Partial",
        ratingActing: 8,
        ratingStory: 6,
      }),
      makeItem({ id: 2, title: "Unrated" }),
    ];
    const { result } = renderHook(() => useListsSorting(items, "your-rating"));
    expect(result.current[0].title).toBe("Partial");
    expect(result.current[1].title).toBe("Unrated");
  });
});
