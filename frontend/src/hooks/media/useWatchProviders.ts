import { useQuery } from "@tanstack/react-query";
import { getWatchProviders, getWatchProviderRegions } from "../../api/watchProviders.api";
import type { MediaType, WatchProvidersResponse, WatchProviderRegionsResponse } from "../../types/tmdb";

export function useWatchProviders(mediaType?: MediaType, mediaId?: number) {
  return useQuery<WatchProvidersResponse>({
    queryKey: ["media", "watchProviders", mediaType, mediaId],
    queryFn: () => getWatchProviders(mediaType!, mediaId!),
    enabled: Boolean(mediaType && mediaId),
    staleTime: 30 * 60 * 1000,
  });
}

export function useWatchProviderRegions() {
  return useQuery<WatchProviderRegionsResponse>({
    queryKey: ["watchProviders", "regions"],
    queryFn: getWatchProviderRegions,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
