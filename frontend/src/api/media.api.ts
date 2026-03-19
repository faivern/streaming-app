import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { DetailMediaGenre } from "../types/tmdb";
import type { MediaType, DetailMedia } from "../types/tmdb";

type GetOpts = { signal?: AbortSignal };

export type MediaGridItem = DetailMediaGenre;

/**
 * Fetch trending media for the grid (multiple pages)
 */
export async function getTrendingMediaGrid(
  mediaType: MediaType,
  timeWindow: "day" | "week" = "day",
  pages: number[] = [1, 2]
): Promise<MediaGridItem[]> {
  const endpoint = `/api/Movies/trending/${mediaType}/${timeWindow}`;

  const responses = await Promise.all(
    pages.map((page) =>
      api.get<Paged<MediaGridItem>>(endpoint, {
        params: { page },
      })
    )
  );

  return responses.flatMap((response) => response.data.results || []);
}

/**
 * Fetch detailed information for a specific media item
 */
export async function getMediaDetails(
  mediaType: MediaType,
  mediaId: number,
  opts: GetOpts = {}
): Promise<DetailMedia> {
  const endpoint = `/api/Movies/${mediaType}/${mediaId}`;
  const { data } = await api.get<DetailMedia>(endpoint, {
    signal: opts.signal,
  });
  return data;
}

