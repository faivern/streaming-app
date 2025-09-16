// hooks/genres/useDiscoverGenre.ts
import { useQuery } from "@tanstack/react-query";
import { getDiscoverGenre } from "../../api/genres.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";
import type { Paged } from "../../types/common";

export function useDiscoverGenre(params: {
  page?: number;
  mediaType?: MediaType;
  genreId?: number; // optional here so we can guard via enabled
}) {
  const { mediaType, genreId, page = 1 } = params;

  return useQuery<Paged<DetailMedia>, Error>({
    queryKey: ["discover", "genre", mediaType, genreId, page],
    queryFn: () => getDiscoverGenre({ mediaType: mediaType!, genreId: genreId!, page }),
    enabled: Boolean(mediaType && genreId),
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      ...data,
      results: (data.results ?? []).map(m => ({ ...m, media_type: mediaType })),
    }),
  });
}
