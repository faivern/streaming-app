import { useQueries } from "@tanstack/react-query";
import { getMediaDetails } from "../../api/media.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export type MediaDetailRequest = {
  id: number;
  mediaType: MediaType;
};

export type MediaDetailQueryResult = {
  data?: DetailMedia;
  isLoading: boolean;
  isError: boolean;
};

export function useMediaDetailsBatch(
  requests: MediaDetailRequest[],
): MediaDetailQueryResult[] {
  const results = useQueries({
    queries: requests.map(({ id, mediaType }) => ({
      queryKey: ["detail", mediaType, id] as const,
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        getMediaDetails(mediaType, id, { signal }),
      staleTime: 10 * 60 * 1000,
    })),
  });

  return results.map((r) => ({
    data: r.data,
    isLoading: r.isLoading,
    isError: r.isError,
  }));
}
