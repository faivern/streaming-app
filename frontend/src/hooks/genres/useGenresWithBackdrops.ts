import { useQuery } from "@tanstack/react-query";
import { useGenres } from "./useGenres";
import { getDiscoverGenre } from "../../api/genres.api";
import type { EnrichedGenre, DetailMedia } from "../../types/tmdb";

/**
 * Sort items by Bayesian weighted rating (descending)
 * WR = (v/(v+m)) × R + (m/(v+m)) × C
 *
 * Higher m = more skeptical of low-vote items
 * - m=10: 12 votes gets 55% weight (too trusting)
 * - m=500: 12 votes gets 2% weight (favors popular titles)
 */
function sortByBayesian(items: DetailMedia[]): DetailMedia[] {
  const validItems = items.filter(
    (item) =>
      typeof item.vote_average === "number" &&
      typeof item.vote_count === "number" &&
      item.vote_count >= 100 && // Minimum vote threshold for quality
      item.backdrop_path,
  );

  if (validItems.length === 0) return [];

  // Use TMDB's typical mean rating (~6.5) for more stable results
  const C = 7.5;
  const m = 15000; // High threshold favors well-known titles

  return validItems
    .map((item) => {
      const v = item.vote_count || 0;
      const R = item.vote_average || 0;
      const WR = (v / (v + m)) * R + (m / (v + m)) * C;
      return { item, WR };
    })
    .sort((a, b) => b.WR - a.WR)
    .map(({ item }) => item);
}

/**
 * Find the best unused backdrop from a sorted list of media items.
 */
function findBestUnusedBackdrop(
  sortedItems: DetailMedia[],
  usedBackdrops: Set<string>,
): string | null {
  for (const item of sortedItems) {
    if (item.backdrop_path && !usedBackdrops.has(item.backdrop_path)) {
      return item.backdrop_path;
    }
  }

  return null;
}

/**
 * Get the best candidates from discover results:
 * prefer Bayesian-sorted items, fall back to any item with a backdrop.
 */
function getCandidates(results: DetailMedia[]): DetailMedia[] {
  const sorted = sortByBayesian(results);
  if (sorted.length > 0) return sorted;
  return results
    .filter((item) => item.backdrop_path)
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
}

// Hardcoded backdrops for genres where TMDB discover returns no backdrop images
const FALLBACK_BACKDROPS: Record<number, string> = {
  10402: "/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg", // Music → Coco (2017)
};

async function fetchDiscoverResults(
  genreId: number,
  mediaType: "movie" | "tv",
): Promise<DetailMedia[]> {
  try {
    const result = await getDiscoverGenre({
      genreId,
      mediaType,
      page: 1,
    });
    return result.results || [];
  } catch {
    return [];
  }
}

export function useGenresWithBackdrops() {
  const { data: genres } = useGenres();

  return useQuery({
    queryKey: ["genres", "with-backdrops"],
    queryFn: async (): Promise<EnrichedGenre[]> => {
      if (!genres || genres.length === 0) return [];

      // Step 1: Fetch discover results for ALL genres in parallel
      const genreDiscoverData = await Promise.all(
        genres.map(async (genre) => {
          const mediaType = genre.supportedMediaTypes.includes("movie")
            ? "movie"
            : "tv";
          const results = await fetchDiscoverResults(genre.id, mediaType);
          const candidates = getCandidates(results);
          return { genre, candidates };
        }),
      );

      // Step 2: Assign unique backdrops sequentially
      const usedBackdrops = new Set<string>();
      const genresWithBackdrops: EnrichedGenre[] = [];

      for (const { genre, candidates } of genreDiscoverData) {
        const backdropPath =
          findBestUnusedBackdrop(candidates, usedBackdrops) ??
          FALLBACK_BACKDROPS[genre.id] ??
          null;

        if (backdropPath) {
          usedBackdrops.add(backdropPath);
        }

        genresWithBackdrops.push({
          ...genre,
          backdropPath,
        });
      }

      return genresWithBackdrops;
    },
    enabled: !!genres && genres.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
