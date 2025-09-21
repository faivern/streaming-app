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

      // Check if detailed data is missing based on media type
      const needsEnrichment = similarMedia.some((item) => {
        if (mediaType === "movie") {
          return !item.runtime; // Movies need runtime
        } else {
          return !item.number_of_seasons || !item.number_of_episodes; // TV needs seasons/episodes
        }
      });

      if (!needsEnrichment) {
        console.log(
          "✅ Similar media already has detailed data, no enrichment needed"
        );
        return similarMedia;
      }

      console.log(
        `🔍 Enriching ${mediaType} similar media with detailed data...`
      );

      // Enrich with detailed data for first few items
      const enrichedMedia = await Promise.all(
        similarMedia.slice(0, 8).map(async (item) => {
          try {
            // Check what data is missing for this specific item
            const needsEnrichmentForItem =
              mediaType === "movie"
                ? !item.runtime
                : !item.number_of_seasons || !item.number_of_episodes;

            if (needsEnrichmentForItem) {
              console.log(
                `🎯 Enriching ${mediaType} ${item.id}: "${
                  item.title || item.name
                }"`
              );

              const detailed = await getMediaDetails(mediaType, item.id);

              if (mediaType === "movie") {
                console.log(
                  `✅ Got runtime for "${item.title}": ${detailed.runtime} min`
                );
                return {
                  ...item,
                  runtime: detailed.runtime,
                };
              } else {
                console.log(
                  `✅ Got TV details for "${item.name}": ${detailed.number_of_seasons} seasons, ${detailed.number_of_episodes} episodes`
                );
                return {
                  ...item,
                  number_of_seasons: detailed.number_of_seasons,
                  number_of_episodes: detailed.number_of_episodes,
                };
              }
            }

            return item; // Item already has the data it needs
          } catch (error) {
            console.warn(
              `❌ Failed to enrich similar media ${item.id}:`,
              error
            );
            return item; // Return original item if enrichment fails
          }
        })
      );

      const finalResult = [
        ...enrichedMedia,
        ...similarMedia.slice(8), // Keep remaining items as-is for performance
      ];

      console.log("🎉 Similar media enrichment complete:", {
        total: finalResult.length,
        enriched: 8,
        mediaType,
        sampleEnriched:
          mediaType === "movie"
            ? { title: finalResult[0]?.title, runtime: finalResult[0]?.runtime }
            : {
                name: finalResult[0]?.name,
                seasons: finalResult[0]?.number_of_seasons,
                episodes: finalResult[0]?.number_of_episodes,
              },
      });

      return finalResult;
    },
    enabled: Boolean(mediaType && mediaId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
