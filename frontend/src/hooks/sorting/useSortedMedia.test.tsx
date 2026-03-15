import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSortedMedia } from "./useSortedMedia";
import type { SortableMedia } from "./types";

describe("useSortedMedia", () => {
  it("returns empty array for undefined items", () => {
    const { result } = renderHook(() => useSortedMedia(undefined, "newest"));
    expect(result.current).toEqual([]);
  });

  it("returns empty array for empty array", () => {
    const { result } = renderHook(() => useSortedMedia([], "newest"));
    expect(result.current).toEqual([]);
  });

  it("sorts A-Z by title, falling back to name", () => {
    const items: SortableMedia[] = [
      { title: "Zorro" },
      { name: "Alpha" },
      { title: "Middle" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "a-z"));
    expect(result.current.map((i) => i.title || i.name)).toEqual([
      "Alpha",
      "Middle",
      "Zorro",
    ]);
  });

  it("sorts Z-A (reverse)", () => {
    const items: SortableMedia[] = [
      { title: "Alpha" },
      { title: "Zorro" },
      { title: "Middle" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "z-a"));
    expect(result.current.map((i) => i.title)).toEqual([
      "Zorro",
      "Middle",
      "Alpha",
    ]);
  });

  it("sorts newest first by release_date, falling back to first_air_date", () => {
    const items: SortableMedia[] = [
      { title: "Old", release_date: "2000-01-01" },
      { title: "TV", first_air_date: "2023-06-15" },
      { title: "New", release_date: "2024-01-01" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "newest"));
    expect(result.current.map((i) => i.title)).toEqual(["New", "TV", "Old"]);
  });

  it("sorts oldest first", () => {
    const items: SortableMedia[] = [
      { title: "New", release_date: "2024-01-01" },
      { title: "Old", release_date: "2000-01-01" },
      { title: "Mid", release_date: "2010-06-15" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "oldest"));
    expect(result.current.map((i) => i.title)).toEqual(["Old", "Mid", "New"]);
  });

  it("sorts by bayesian rating", () => {
    const items: SortableMedia[] = [
      { title: "Low", vote_average: 5, vote_count: 100 },
      { title: "High", vote_average: 9, vote_count: 100 },
      { title: "Med", vote_average: 7, vote_count: 100 },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "bayesian"));
    expect(result.current.map((i) => i.title)).toEqual([
      "High",
      "Med",
      "Low",
    ]);
  });

  it("items without dates sort to end (newest)", () => {
    const items: SortableMedia[] = [
      { title: "NoDate" },
      { title: "HasDate", release_date: "2020-01-01" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "newest"));
    expect(result.current.map((i) => i.title)).toEqual([
      "HasDate",
      "NoDate",
    ]);
  });

  it("items without titles sort to end (a-z)", () => {
    const items: SortableMedia[] = [
      { title: "" },
      { title: "Beta" },
      { title: "Alpha" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "a-z"));
    expect(result.current.map((i) => i.title)).toEqual([
      "Alpha",
      "Beta",
      "",
    ]);
  });

  it("default/unknown sort returns copy of items", () => {
    const items: SortableMedia[] = [
      { title: "A" },
      { title: "B" },
    ];
    const { result } = renderHook(() =>
      useSortedMedia(items, "unknown" as never)
    );
    expect(result.current).toEqual(items);
    expect(result.current).not.toBe(items);
  });

  it("chronological sorts same as default (falls through)", () => {
    const items: SortableMedia[] = [
      { title: "New", release_date: "2024-01-01" },
      { title: "Old", release_date: "2000-01-01" },
    ];
    const { result } = renderHook(() =>
      useSortedMedia(items, "chronological")
    );
    // chronological is not handled as a case in useSortedMedia, falls to default
    expect(result.current).toEqual(items);
    expect(result.current).not.toBe(items);
  });

  it("bayesian with no rated items returns copy", () => {
    const items: SortableMedia[] = [
      { title: "A" },
      { title: "B" },
    ];
    const { result } = renderHook(() => useSortedMedia(items, "bayesian"));
    expect(result.current).toEqual(items);
    expect(result.current).not.toBe(items);
  });
});
