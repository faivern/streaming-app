import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getAdvancedDiscover,
  type AdvancedDiscoverParams,
} from "../../api/advancedDiscover.api";
import type { DetailMedia } from "../../types/tmdb";
import type { Paged } from "../../types/common";

export const infiniteAdvancedDiscoverKeys = {
  all: ["infiniteAdvancedDiscover"] as const,
  filters: (params: Omit<AdvancedDiscoverParams, "page">) =>
    [...infiniteAdvancedDiscoverKeys.all, params] as const,
};

export function useInfiniteAdvancedDiscover(
  params: Omit<AdvancedDiscoverParams, "page">,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery<Paged<DetailMedia>, Error>({
    queryKey: infiniteAdvancedDiscoverKeys.filters(params),
    queryFn: ({ pageParam }) =>
      getAdvancedDiscover({ ...params, page: pageParam as number }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}
