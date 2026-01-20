import { useQuery } from "@tanstack/react-query";
import { getTopRatedMedia } from "../../api/toprated.api";
import type { TrendingMedia } from "../../types/tmdb";

export function useTopRatedMedia(mediaType: "movie" | "tv" = "movie") {
  return useQuery<TrendingMedia[]>({
    queryKey: ["topRated", mediaType],
    queryFn: () => getTopRatedMedia(mediaType),
    staleTime: 5 * 60 * 1000,
  });
}
