// hooks/media/useCardDetails.ts
import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "../../api/media.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export function getRuntimeMinutes(d?: DetailMedia): number | undefined {
  if (!d) return;
  if (d.media_type === "movie") return d.runtime ?? undefined;
  const ep = Array.isArray(d.episode_run_time) ? d.episode_run_time[0] : undefined;
  return ep ?? undefined;
}

export function useCardDetails(mediaType?: MediaType, id?: number) {
  return useQuery<DetailMedia>({
    queryKey: ["details", mediaType, id],
    queryFn: () => getMediaDetails(mediaType!, id!),
    enabled: Boolean(mediaType && id),
    staleTime: 60 * 60 * 1000, // 1h cache
    gcTime: 2 * 60 * 60 * 1000, // keep cached a bit longer
  });
}
