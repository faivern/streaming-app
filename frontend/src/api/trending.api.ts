import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { TrendingMedia } from "../types/tmdb";

export async function getTrendingMedia(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "day",
  page = 1,
  language = "en-US"
) {
  const { data } = await api.get<Paged<TrendingMedia>>(
    `api/Movies/trending/${mediaType}/${timeWindow}`,
    { params: { page, language } }
  );
  return data.results ?? [];
}
