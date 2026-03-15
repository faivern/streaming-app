import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDiscoverFilters } from "./useDiscoverFilters";

describe("useDiscoverFilters", () => {
  it("returns default filters initially", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    expect(result.current.filters).toEqual({
      mediaType: "movie",
      genreIds: [],
      releaseYearRange: {},
      minRating: 0,
      runtimeRange: {},
      language: "",
      sortBy: "popularity.desc",
    });
  });

  it("setMediaType changes mediaType", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.setMediaType("tv"));
    expect(result.current.filters.mediaType).toBe("tv");
  });

  it("setMediaType resets genreIds when switching", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ genreIds: [28, 12] })
    );
    act(() => result.current.setMediaType("tv"));
    expect(result.current.filters.genreIds).toEqual([]);
  });

  it("setMediaType resets runtimeRange when switching to tv", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ runtimeRange: { min: 90, max: 180 } })
    );
    act(() => result.current.setMediaType("tv"));
    expect(result.current.filters.runtimeRange).toEqual({});
  });

  it("toggleGenre adds genre", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.toggleGenre(28));
    expect(result.current.filters.genreIds).toEqual([28]);
  });

  it("toggleGenre removes existing genre", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ genreIds: [28, 12] })
    );
    act(() => result.current.toggleGenre(28));
    expect(result.current.filters.genreIds).toEqual([12]);
  });

  it("setGenres replaces all genres", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ genreIds: [28] })
    );
    act(() => result.current.setGenres([10, 20, 30]));
    expect(result.current.filters.genreIds).toEqual([10, 20, 30]);
  });

  it("clearGenres empties genres", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ genreIds: [28, 12] })
    );
    act(() => result.current.clearGenres());
    expect(result.current.filters.genreIds).toEqual([]);
  });

  it("setReleaseYearRange updates range", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.setReleaseYearRange({ min: 2000, max: 2020 }));
    expect(result.current.filters.releaseYearRange).toEqual({
      min: 2000,
      max: 2020,
    });
  });

  it("clearReleaseYearRange resets to {}", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ releaseYearRange: { min: 2000 } })
    );
    act(() => result.current.clearReleaseYearRange());
    expect(result.current.filters.releaseYearRange).toEqual({});
  });

  it("setMinRating updates rating", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.setMinRating(7));
    expect(result.current.filters.minRating).toBe(7);
  });

  it("clearMinRating resets to 0", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ minRating: 7 })
    );
    act(() => result.current.clearMinRating());
    expect(result.current.filters.minRating).toBe(0);
  });

  it("setRuntimeRange updates range", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.setRuntimeRange({ min: 90, max: 180 }));
    expect(result.current.filters.runtimeRange).toEqual({
      min: 90,
      max: 180,
    });
  });

  it("clearRuntimeRange resets to {}", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ runtimeRange: { min: 90 } })
    );
    act(() => result.current.clearRuntimeRange());
    expect(result.current.filters.runtimeRange).toEqual({});
  });

  it("setLanguage updates language", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    act(() => result.current.setLanguage("es-ES"));
    expect(result.current.filters.language).toBe("es-ES");
  });

  it("clearLanguage resets to empty string", () => {
    const { result } = renderHook(() =>
      useDiscoverFilters({ language: "es-ES" })
    );
    act(() => result.current.clearLanguage());
    expect(result.current.filters.language).toBe("");
  });

  it("hasActiveFilters returns false with defaults", () => {
    const { result } = renderHook(() => useDiscoverFilters());
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("hasActiveFilters returns true when any filter active", () => {
    const { result } = renderHook(() => useDiscoverFilters());

    act(() => result.current.toggleGenre(28));
    expect(result.current.hasActiveFilters).toBe(true);

    // Reset and try another filter
    act(() => result.current.resetFilters());
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => result.current.setMinRating(5));
    expect(result.current.hasActiveFilters).toBe(true);
  });
});
