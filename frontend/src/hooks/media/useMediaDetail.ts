import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "../../api/media.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export function useMediaDetail(mediaType?: MediaType, id?: number) {
  return useQuery<DetailMedia>({
    queryKey: ["media", "details", mediaType, id],
    queryFn: () => getMediaDetails(mediaType!, id!),
    enabled: Boolean(mediaType && id),
    staleTime: 5 * 60 * 1000,
  });
}
