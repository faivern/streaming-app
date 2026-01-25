import { useMemo } from "react";
import { useGenres } from "./useGenres";
import type { EnrichedGenre, MediaType } from "../../types/tmdb";

type UseGenreByIdResult = {
  genre: EnrichedGenre | undefined;
  supportsMovie: boolean;
  supportsTv: boolean;
  supportsBoth: boolean;
  defaultMediaType: MediaType;
  isLoading: boolean;
  isError: boolean;
};

export function useGenreById(genreId: number | undefined): UseGenreByIdResult {
  const { data: genres, isLoading, isError } = useGenres();

  return useMemo(() => {
    const genre = genres?.find((g) => g.id === genreId);

    const supportsMovie = genre?.supportedMediaTypes.includes("movie") ?? false;
    const supportsTv = genre?.supportedMediaTypes.includes("tv") ?? false;
    const supportsBoth = supportsMovie && supportsTv;

    // Default to movie if supported, otherwise tv
    const defaultMediaType: MediaType = supportsMovie ? "movie" : "tv";

    return {
      genre,
      supportsMovie,
      supportsTv,
      supportsBoth,
      defaultMediaType,
      isLoading,
      isError,
    };
  }, [genres, genreId, isLoading, isError]);
}
