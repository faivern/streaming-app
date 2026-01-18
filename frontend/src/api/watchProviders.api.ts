import { api } from "./http/axios";
import type { MediaType, WatchProvidersResponse, WatchProviderRegionsResponse } from "../types/tmdb";

export async function getWatchProviders(
  mediaType: MediaType,
  mediaId: number
): Promise<WatchProvidersResponse> {
  const endpoint = `/api/Movies/${mediaType}/${mediaId}/watch/providers`;
  const { data } = await api.get<WatchProvidersResponse>(endpoint);
  return data;
}

export async function getWatchProviderRegions(): Promise<WatchProviderRegionsResponse> {
  const endpoint = `/api/Movies/watch/providers/regions`;
  const { data } = await api.get<WatchProviderRegionsResponse>(endpoint);
  return data;
}
