import { useQuery } from "@tanstack/react-query";
import { getSimilarMedia } from "../../api/similarMedia.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export function useSimilarMedia(mediaType: MediaType, mediaId: number) {
  return useQuery<DetailMedia[]>({
    queryKey: ["media", "similar", mediaType, mediaId],
    queryFn: () => getSimilarMedia(mediaType, mediaId),
    enabled: Boolean(mediaType && mediaId),
    staleTime: 5 * 60 * 1000,
  });
}