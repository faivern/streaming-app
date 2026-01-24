import { useInfiniteQuery } from "@tanstack/react-query";
import { getDiscoverGenre } from "../../api/genres.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";
import type { Paged } from "../../types/common";

export function useInfiniteDiscoverGenre(params: {
  mediaType?: MediaType;
  genreId?: number;
}) {
  const { mediaType, genreId } = params;

  return useInfiniteQuery<Paged<DetailMedia>, Error>({
    queryKey: ["discover", "genre", "infinite", mediaType, genreId],
    queryFn: ({ pageParam }) =>
      getDiscoverGenre({ mediaType: mediaType!, genreId: genreId!, page: pageParam as number }),
    enabled: Boolean(mediaType && genreId),
    staleTime: 5 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        results: (page.results ?? []).map((m) => ({ ...m, media_type: mediaType })),
      })),
    }),
  });
}
