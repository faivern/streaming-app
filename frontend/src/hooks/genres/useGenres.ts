import { useQuery } from "@tanstack/react-query";
import { getMovieGenres, getTvGenres } from "../../api/genres.api";
import type { EnrichedGenre, MediaType } from "../../types/tmdb";

export function useGenres() {
  return useQuery({
    queryKey: ["genres", "enriched"],
    queryFn: async (): Promise<EnrichedGenre[]> => {
      const [movieGenres, tvGenres] = await Promise.all([
        getMovieGenres(),
        getTvGenres(),
      ]);

      // Build a map to track which media types each genre supports
      const genreMap = new Map<number, EnrichedGenre>();

      // Process movie genres first
      for (const genre of movieGenres ?? []) {
        genreMap.set(genre.id, {
          id: genre.id,
          name: genre.name,
          supportedMediaTypes: ["movie"] as MediaType[],
        });
      }

      // Process TV genres - add 'tv' to existing or create new entry
      for (const genre of tvGenres ?? []) {
        const existing = genreMap.get(genre.id);
        if (existing) {
          existing.supportedMediaTypes.push("tv");
        } else {
          genreMap.set(genre.id, {
            id: genre.id,
            name: genre.name,
            supportedMediaTypes: ["tv"] as MediaType[],
          });
        }
      }

      return Array.from(genreMap.values());
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
