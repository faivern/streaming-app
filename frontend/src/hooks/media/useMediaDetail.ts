import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMediaDetails } from "../../api/media.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export function useMediaDetail(mediaType?: MediaType, id?: number, initial?: Partial<DetailMedia>) {
  return useQuery<DetailMedia>({
    queryKey: ["detail", mediaType, id],
    queryFn: ({ signal }) => getMediaDetails(mediaType!, id!, { signal }),
    enabled: Boolean(mediaType && id),
    staleTime: 10 * 60 * 1000,
    initialData: initial as DetailMedia | undefined,
  });
}

export function usePrefetchMediaDetail() {
  const qc = useQueryClient();
  return (mediaType: MediaType, id: number, signal?: AbortSignal) =>
    qc.prefetchQuery({
      queryKey: ["detail", mediaType, id],
      queryFn: () => getMediaDetails(mediaType, id, { signal }),
      staleTime: 10 * 60 * 1000,
    });
}