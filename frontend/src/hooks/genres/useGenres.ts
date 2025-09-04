import { useQuery } from "@tanstack/react-query";
import { getMovieGenres, getTvGenres } from "../../api/genres.api";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const [movieGenres, tvGenres] = await Promise.all([
        getMovieGenres(),
        getTvGenres(),
      ]);
      return [...(movieGenres ?? []), ...(tvGenres ?? [])];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
