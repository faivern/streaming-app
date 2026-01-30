import { useState, useCallback, useMemo } from "react";

export type DiscoverMediaType = "movie" | "tv" | "both";

export type DiscoverFilters = {
  mediaType: DiscoverMediaType;
  genreIds: number[];
  releaseYearRange: { min?: number; max?: number };
  minRating: number;
  runtimeRange: { min?: number; max?: number };
  language: string;
  sortBy: string;
};

const defaultFilters: DiscoverFilters = {
  mediaType: "movie",
  genreIds: [],
  releaseYearRange: {},
  minRating: 0,
  runtimeRange: {},
  language: "",
  sortBy: "vote_average.desc",
};

export function useDiscoverFilters(initialFilters?: Partial<DiscoverFilters>) {
  const [filters, setFilters] = useState<DiscoverFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const setMediaType = useCallback((mediaType: DiscoverMediaType) => {
    setFilters((prev) => ({
      ...prev,
      mediaType,
      // Reset genres when switching media type since they differ between movie/tv
      // For "both", we also reset to avoid invalid genre combinations
      genreIds: [],
      // Reset runtime when switching to/from "both" or "tv" (runtime filter is movie-only)
      runtimeRange: mediaType === "movie" ? prev.runtimeRange : {},
    }));
  }, []);

  const toggleGenre = useCallback((genreId: number) => {
    setFilters((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  }, []);

  const setGenres = useCallback((genreIds: number[]) => {
    setFilters((prev) => ({ ...prev, genreIds }));
  }, []);

  const setReleaseYearRange = useCallback(
    (range: { min?: number; max?: number }) => {
      setFilters((prev) => ({ ...prev, releaseYearRange: range }));
    },
    []
  );

  const setMinRating = useCallback((minRating: number) => {
    setFilters((prev) => ({ ...prev, minRating }));
  }, []);

  const setRuntimeRange = useCallback(
    (range: { min?: number; max?: number }) => {
      setFilters((prev) => ({ ...prev, runtimeRange: range }));
    },
    []
  );

  const setLanguage = useCallback((language: string) => {
    setFilters((prev) => ({ ...prev, language }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.genreIds.length > 0 ||
      filters.releaseYearRange.min !== undefined ||
      filters.releaseYearRange.max !== undefined ||
      filters.minRating > 0 ||
      filters.runtimeRange.min !== undefined ||
      filters.runtimeRange.max !== undefined ||
      filters.language !== "" ||
      filters.sortBy !== "vote_average.desc"
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    setMediaType,
    toggleGenre,
    setGenres,
    setReleaseYearRange,
    setMinRating,
    setRuntimeRange,
    setLanguage,
    setSortBy,
    resetFilters,
    hasActiveFilters,
  };
}
