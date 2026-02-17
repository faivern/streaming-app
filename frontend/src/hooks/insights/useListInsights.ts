import { useQuery } from "@tanstack/react-query";
import { useListById } from "../lists/useLists";
import { useMediaEntries } from "../lists/useMediaEntries";
import { getMediaDetails } from "../../api/media.api";
import { getMediaCredits } from "../../api/credit.api";
import {
  computeGenreDistribution,
  getTopGenres,
  computeTopActors,
  computeTopDirectors,
  computeRatingComparison,
  computeMostActiveMonth,
  computeReleaseYearBreakdown,
} from "../../lib/insights/aggregators";
import type { ListInsights, EnrichedListItem } from "../../types/insights";
import type { MediaType } from "../../types/tmdb";
import type { ListItem } from "../../types/list";

/**
 * Enriches list items with TMDB details and credits in parallel batches
 * Uses Promise.allSettled for graceful failure of individual items
 */
async function enrichListItems(items: ListItem[]): Promise<EnrichedListItem[]> {
  if (!items || items.length === 0) {
    return [];
  }

  // Batch fetch all details
  const detailsPromises = items.map((item) =>
    getMediaDetails(item.mediaType as MediaType, item.tmdbId).catch((error) => {
      console.warn(
        `Failed to fetch details for ${item.mediaType} ${item.tmdbId}:`,
        error
      );
      return null;
    })
  );

  // Batch fetch all credits
  const creditsPromises = items.map((item) =>
    getMediaCredits(item.mediaType as MediaType, item.tmdbId).catch((error) => {
      console.warn(
        `Failed to fetch credits for ${item.mediaType} ${item.tmdbId}:`,
        error
      );
      return null;
    })
  );

  // Execute both batches in parallel
  const [detailsResults, creditsResults] = await Promise.all([
    Promise.allSettled(detailsPromises),
    Promise.allSettled(creditsPromises),
  ]);

  // Merge results into enriched items
  const enrichedItems: EnrichedListItem[] = items
    .map((item, index) => {
      const detailsResult = detailsResults[index];
      const creditsResult = creditsResults[index];

      const details =
        detailsResult.status === "fulfilled" && detailsResult.value
          ? detailsResult.value
          : undefined;
      const credits =
        creditsResult.status === "fulfilled" && creditsResult.value
          ? creditsResult.value
          : undefined;

      // Filter out items where both enrichment attempts failed
      if (!details && !credits) {
        console.warn(
          `Skipping item ${item.tmdbId} - both details and credits failed`
        );
        return null;
      }

      return {
        ...item,
        details,
        credits,
      };
    })
    .filter((item): item is EnrichedListItem => item !== null);

  return enrichedItems;
}

/**
 * Hook to fetch and compute insights for a specific list
 * Enriches items with TMDB details + credits, then aggregates metrics
 */
export function useListInsights(listId: number) {
  const { data: list, isLoading: isLoadingList } = useListById(listId);
  const { data: mediaEntries = [] } = useMediaEntries();

  // Content fingerprint: changes whenever the list's items change, forcing a fresh query
  const itemsFingerprint = (list?.items ?? [])
    .map((i) => `${i.tmdbId}-${i.mediaType}`)
    .sort()
    .join(",");

  const insightsQuery = useQuery<ListInsights>({
    queryKey: ["insights", "list", listId, itemsFingerprint],
    queryFn: async () => {
      if (!list?.items || list.items.length === 0) {
        throw new Error("List has no items");
      }

      // Step 1: Enrich items with TMDB data
      const enrichedItems = await enrichListItems(list.items);

      if (enrichedItems.length === 0) {
        throw new Error("Failed to enrich any list items");
      }

      // Step 2: Compute all metrics
      const genreDistribution = computeGenreDistribution(enrichedItems);
      const topGenres = getTopGenres(genreDistribution, 5);
      const topActors = computeTopActors(enrichedItems, 3);
      const topDirectors = computeTopDirectors(enrichedItems, 3);
      const ratingComparison = computeRatingComparison(
        enrichedItems,
        mediaEntries
      );
      const mostActiveMonth = computeMostActiveMonth(list.items);
      const releaseYearBreakdown = computeReleaseYearBreakdown(enrichedItems);

      // Step 3: Return complete ListInsights object
      return {
        totalCount: list.items.length,
        genreDistribution,
        topGenres,
        topActors,
        topDirectors,
        ratingComparison,
        mostActiveMonth,
        releaseYearBreakdown,
      };
    },
    enabled: Boolean(list?.items?.length),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: insightsQuery.data,
    isLoading: isLoadingList || insightsQuery.isLoading,
    isError: insightsQuery.isError,
    error: insightsQuery.error,
    listName: list?.name,
    listDescription: list?.description,
  };
}
