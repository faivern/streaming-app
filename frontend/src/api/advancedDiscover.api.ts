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
};

export async function getAdvancedDiscover(
  params: AdvancedDiscoverParams
): Promise<Paged<DetailMedia>> {
  const { data } = await api.get<Paged<DetailMedia>>(
    "/api/Movies/discover/advanced",
    {
      params: {
        mediaType: params.mediaType,
        genreIds: params.genreIds,
        primaryReleaseYearGte: params.primaryReleaseYearGte,
        primaryReleaseYearLte: params.primaryReleaseYearLte,
        voteAverageGte: params.voteAverageGte,
        runtimeGte: params.runtimeGte,
        runtimeLte: params.runtimeLte,
        language: params.language,
        sortBy: params.sortBy || "popularity.desc",
        page: params.page || 1,
      },
      paramsSerializer: {
        indexes: null, // Serialize arrays as genreIds=1&genreIds=2
      },
    }
  );
  return data;
}
