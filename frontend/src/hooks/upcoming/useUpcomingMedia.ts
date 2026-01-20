import { useQuery } from "@tanstack/react-query";
import { getUpcomingMedia } from "../../api/upcoming.api";
import type { TrendingMedia } from "../../types/tmdb";

export function useUpcomingMedia(mediaType: "movie" | "tv" = "movie") {
  return useQuery<TrendingMedia[]>({
    queryKey: ["upcoming", mediaType],
    queryFn: () => getUpcomingMedia(mediaType),
    staleTime: 5 * 60 * 1000,
  });
}
