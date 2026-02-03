import { api } from "./http/axios";
import type {
  MediaType,
  WatchProvidersResponse,
  WatchProviderRegionsResponse,
  WatchProviderListResponse,
} from "../types/tmdb";

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

export async function getMovieWatchProvidersList(
  watchRegion: string = "US"
): Promise<WatchProviderListResponse> {
  const endpoint = `/api/Movies/watch/providers/movie`;
  const { data } = await api.get<WatchProviderListResponse>(endpoint, {
    params: { watchRegion },
  });
  return data;
}

export async function getTvWatchProvidersList(
  watchRegion: string = "US"
): Promise<WatchProviderListResponse> {
  const endpoint = `/api/Movies/watch/providers/tv`;
  const { data } = await api.get<WatchProviderListResponse>(endpoint, {
    params: { watchRegion },
  });
  return data;
}
