import { useQuery } from "@tanstack/react-query";
import {
  getMovieWatchProvidersList,
  getTvWatchProvidersList,
} from "../../api/watchProviders.api";
import type { WatchProviderListItem } from "../../types/tmdb";

/**
 * Major streaming providers sorted by general popularity/relevance.
 * Providers in this list appear first (in this order), then the rest sorted by TMDB priority.
 * Provider IDs from TMDB API.
 */
const PRIORITY_PROVIDER_IDS: number[] = [
  8,    // Netflix
  337,  // Disney+
  9,    // Amazon Prime Video
  384,  // HBO Max (Max)
  15,   // Hulu
  350,  // Apple TV+
  531,  // Paramount+
  386,  // Peacock
  1899, // Max
  283,  // Crunchyroll
  387,  // Peacock Premium
  43,   // Starz
  37,   // Showtime
  230,  // Discovery+
  619,  // Star+
  119,  // Amazon Prime Video (alternate)
  39,   // NOW (UK)
  175,  // Netflix Kids
];

/**
 * Fetches all watch providers (streaming services) for a given region.
 * Combines movie + TV providers, deduplicates by provider_id.
 * Sorts with priority providers first, then by TMDB display_priority.
 */
export function useWatchProvidersList(watchRegion: string = "US") {
  return useQuery<WatchProviderListItem[]>({
    queryKey: ["watchProviders", "list", watchRegion],
    queryFn: async () => {
      // Fetch both movie and TV providers in parallel
      const [movieProviders, tvProviders] = await Promise.all([
        getMovieWatchProvidersList(watchRegion),
        getTvWatchProvidersList(watchRegion),
      ]);

      // Combine and deduplicate by provider_id
      const providerMap = new Map<number, WatchProviderListItem>();

      // Add movie providers first
      for (const provider of movieProviders.results) {
        providerMap.set(provider.provider_id, provider);
      }

      // Add TV providers (will overwrite if same id, keeping TV priority)
      for (const provider of tvProviders.results) {
        if (!providerMap.has(provider.provider_id)) {
          providerMap.set(provider.provider_id, provider);
        }
      }

      // Convert to array and sort with priority providers first
      const providers = Array.from(providerMap.values());

      providers.sort((a, b) => {
        const aIndex = PRIORITY_PROVIDER_IDS.indexOf(a.provider_id);
        const bIndex = PRIORITY_PROVIDER_IDS.indexOf(b.provider_id);

        // Both are priority providers: sort by priority list order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        // Only a is priority: a comes first
        if (aIndex !== -1) return -1;

        // Only b is priority: b comes first
        if (bIndex !== -1) return 1;

        // Neither is priority: fall back to TMDB display_priority
        return a.display_priority - b.display_priority;
      });

      return providers;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
