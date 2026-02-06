import { api } from "./http/axios";
import type { DetailMedia } from "../types/tmdb";
import type { Paged } from "../types/common";

export type AdvancedDiscoverParams = {
  mediaType: "movie" | "tv";
  genreIds?: number[];
  primaryReleaseYearGte?: number;
  primaryReleaseYearLte?: number;
  voteAverageGte?: number;
  runtimeGte?: number;
  runtimeLte?: number;
  language?: string;
  sortBy?: string;
  page?: number;
  withWatchProviders?: number;
  watchRegion?: string;
};

export async function getAdvancedDiscover(
  params: AdvancedDiscoverParams
): Promise<Paged<DetailMedia>> {
  // Build params object, filtering out undefined values explicitly
  const queryParams: Record<string, unknown> = {
    mediaType: params.mediaType,
    sortBy: params.sortBy || "vote_average.desc",
    page: params.page || 1,
  };

  // Only include optional params if they have values
  if (params.genreIds && params.genreIds.length > 0) {
    queryParams.genreIds = params.genreIds;
  }
  if (params.primaryReleaseYearGte !== undefined) {
    queryParams.primaryReleaseYearGte = params.primaryReleaseYearGte;
  }
  if (params.primaryReleaseYearLte !== undefined) {
    queryParams.primaryReleaseYearLte = params.primaryReleaseYearLte;
  }
  if (params.voteAverageGte !== undefined) {
    queryParams.voteAverageGte = params.voteAverageGte;
  }
  if (params.runtimeGte !== undefined) {
    queryParams.runtimeGte = params.runtimeGte;
  }
  if (params.runtimeLte !== undefined) {
    queryParams.runtimeLte = params.runtimeLte;
  }
  if (params.language) {
    queryParams.language = params.language;
  }
  if (params.withWatchProviders !== undefined) {
    queryParams.withWatchProviders = params.withWatchProviders;
  }
  if (params.watchRegion) {
    queryParams.watchRegion = params.watchRegion;
  }

  const { data } = await api.get<Paged<DetailMedia>>(
    "/api/Movies/discover/advanced",
    {
      params: queryParams,
      paramsSerializer: {
        indexes: null, // Serialize arrays as genreIds=1&genreIds=2
      },
    }
  );
  return data;
}
