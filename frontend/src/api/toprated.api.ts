import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { TrendingMedia } from "../types/tmdb";

export async function getTopRatedMedia(mediaType: "movie" | "tv" = "movie") {
  const { data } = await api.get<Paged<TrendingMedia>>(
    `/api/Movies/top_rated/${mediaType}`
  );
  return data.results ?? [];
}
