import { useInfiniteQuery } from "@tanstack/react-query";
import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";
import type { Paged } from "../../types/common";

type UseInfiniteDiscoverByProviderParams = {
  providerId?: number;
  mediaType?: MediaType;
  watchRegion?: string;
  sortBy?: string;
};

/**
 * Infinite scroll hook for discovering media by streaming provider.
 * Uses the advanced discover API with watch provider filtering.
 */
export function useInfiniteDiscoverByProvider(
  params: UseInfiniteDiscoverByProviderParams
) {
  const { providerId, mediaType, watchRegion = "US", sortBy = "popularity.desc" } = params;

  return useInfiniteQuery<Paged<DetailMedia>, Error>({
    queryKey: [
      "discover",
      "provider",
      "infinite",
      providerId,
      mediaType,
      watchRegion,
      sortBy,
    ],
    queryFn: ({ pageParam }) =>
      getAdvancedDiscover({
        mediaType: mediaType!,
        withWatchProviders: providerId!,
        watchRegion,
        page: pageParam as number,
        sortBy,
      }),
    enabled: Boolean(providerId && mediaType),
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        results: (page.results ?? []).map((m) => ({
          ...m,
          media_type: mediaType,
        })),
      })),
    }),
  });
}
