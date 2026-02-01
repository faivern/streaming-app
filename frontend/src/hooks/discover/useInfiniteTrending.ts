import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrendingMediaPaged } from "../../api/trending.api";
import type { TrendingMedia } from "../../types/tmdb";
import type { Paged } from "../../types/common";

export type TrendingParams = {
  mediaType: "movie" | "tv";
  timeWindow?: "day" | "week";
};

export const infiniteTrendingKeys = {
  all: ["infiniteTrending"] as const,
  filters: (params: TrendingParams) =>
    [...infiniteTrendingKeys.all, params] as const,
};

export function useInfiniteTrending(
  params: TrendingParams,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery<Paged<TrendingMedia>, Error>({
    queryKey: infiniteTrendingKeys.filters(params),
    queryFn: ({ pageParam }) =>
      getTrendingMediaPaged(
        params.mediaType,
        params.timeWindow ?? "day",
        pageParam as number
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}
