import { useQuery } from "@tanstack/react-query";
import {
  getMovieWatchProvidersList,
  getTvWatchProvidersList,
} from "../../api/watchProviders.api";
import type { WatchProviderListItem } from "../../types/tmdb";

/**
 * Fetches all watch providers (streaming services) for a given region.
 * Combines movie + TV providers, deduplicates by provider_id, and sorts by display_priority.
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

      // Convert to array and sort by display_priority (lower = more prominent)
      const providers = Array.from(providerMap.values());
      providers.sort((a, b) => a.display_priority - b.display_priority);

      return providers;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
