import { useQuery } from "@tanstack/react-query";
import { useUserLists } from "../lists/useLists";
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
 * Hook to fetch and compute aggregated insights across all user lists
 * Deduplicates items by tmdbId + mediaType (same media in multiple lists counts once)
 */
export function useMasterInsights() {
  const { data: lists = [], isLoading: isLoadingLists } = useUserLists();
  const { data: mediaEntries = [] } = useMediaEntries();

  // Flatten and deduplicate all list items
  const allItems = lists.flatMap((list) => list.items);
  const deduplicatedItems = Array.from(
    new Map(
      allItems.map((item) => [
        `${item.tmdbId}-${item.mediaType}`,
        item,
      ])
    ).values()
  );

  const insightsQuery = useQuery<ListInsights>({
    queryKey: ["insights", "master"],
    queryFn: async () => {
      if (deduplicatedItems.length === 0) {
        throw new Error("No items found across all lists");
      }

      // Step 1: Enrich items with TMDB data
      const enrichedItems = await enrichListItems(deduplicatedItems);

      if (enrichedItems.length === 0) {
        throw new Error("Failed to enrich any list items");
      }

      // Step 2: Compute all metrics
      const genreDistribution = computeGenreDistribution(enrichedItems);
      const topGenres = getTopGenres(genreDistribution, 5);
      const topActors = computeTopActors(enrichedItems, 5);
      const topDirectors = computeTopDirectors(enrichedItems, 5);
      const ratingComparison = computeRatingComparison(
        enrichedItems,
        mediaEntries
      );
      const mostActiveMonth = computeMostActiveMonth(allItems);
      const releaseYearBreakdown = computeReleaseYearBreakdown(enrichedItems);

      // Step 3: Return complete ListInsights object
      return {
        totalCount: deduplicatedItems.length,
        genreDistribution,
        topGenres,
        topActors,
        topDirectors,
        ratingComparison,
        mostActiveMonth,
        releaseYearBreakdown,
      };
    },
    enabled: Boolean(deduplicatedItems.length),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: insightsQuery.data,
    isLoading: isLoadingLists || insightsQuery.isLoading,
    isError: insightsQuery.isError,
    error: insightsQuery.error,
    totalListCount: lists.length,
  };
}
