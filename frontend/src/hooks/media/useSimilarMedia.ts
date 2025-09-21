import { useQuery } from "@tanstack/react-query";
import { getSimilarMedia } from "../../api/similarMedia.api";
import { getMediaDetails } from "../../api/media.api";
import type { DetailMedia, MediaType } from "../../types/tmdb";

export function useSimilarMedia(mediaType: MediaType, mediaId: number) {
  return useQuery<DetailMedia[]>({
    queryKey: ["media", "similar", mediaType, mediaId],
    queryFn: async () => {
      // Get basic similar media
      const similarMedia = await getSimilarMedia(mediaType, mediaId);

      // Check if runtime data is missing
      const needsEnrichment = similarMedia.some(
        (item) => mediaType === "movie" && !item.runtime
      );

      if (!needsEnrichment) {
        return similarMedia;
      }

      // Enrich with detailed data for first few items
      const enrichedMedia = await Promise.all(
        similarMedia.slice(0, 8).map(async (item) => {
          try {
            if (mediaType === "movie" && !item.runtime) {
              const detailed = await getMediaDetails(mediaType, item.id);
              return { ...item, runtime: detailed.runtime };
            }
            return item;
          } catch (error) {
            console.warn(`Failed to enrich similar media ${item.id}:`, error);
            return item;
          }
        })
      );

      return [...enrichedMedia, ...similarMedia.slice(8)]; // Keep remaining items as-is
    },
    enabled: Boolean(mediaType && mediaId),
    staleTime: 5 * 60 * 1000,
  });
}
