import { useQuery } from "@tanstack/react-query";
import { getTrendingMedia } from "../../api/trending.api";
import type { TrendingMedia } from "../../types/tmdb";

export function useTrendingMedia(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "day",
  page = 1,
  language = "en-US"
) {
  return useQuery<TrendingMedia[]>({
    queryKey: ["trending", mediaType, timeWindow, page, language],
    queryFn: () => getTrendingMedia(mediaType, timeWindow, page, language),
    staleTime: 5 * 60 * 1000,
  });
}