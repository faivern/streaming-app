import { useQuery } from "@tanstack/react-query";
import { getKeywords } from "../../api/keywords.api";
import type { Keyword, MediaType } from "../../types/tmdb";

export function useMediaKeywords(mediaType?: MediaType, mediaId?: number) {
  return useQuery<Keyword[]>({
    queryKey: ["media", "keywords", mediaType, mediaId],
    queryFn: () => getKeywords(mediaType!, mediaId!),
    enabled: Boolean(mediaType && mediaId),
    staleTime: 5 * 60 * 1000,
  });
}
