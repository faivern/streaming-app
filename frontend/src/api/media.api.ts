import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { DetailMediaGenre } from "../types/tmdb";
import type { MediaType, DetailMedia } from "../types/tmdb";

type GetOpts = { signal?: AbortSignal };

export type MediaGridItem = DetailMediaGenre;


export type MediaDetailsResponse = {
  id: number;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
};

/**
 * Fetch trending media for the grid (multiple pages)
 */
export async function getTrendingMediaGrid(
  mediaType: MediaType,
  timeWindow: "day" | "week" = "day",
  pages: number[] = [1, 2]
): Promise<MediaGridItem[]> {
  const endpoint = `api/Movies/trending/${mediaType}/${timeWindow}`;

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

  const endpoint = `api/Movies/${mediaType}/${mediaId}`;
  const { data } = await api.get<DetailMedia>(endpoint, { signal: opts.signal });
  return data;
}

/**
 * Fetch details for multiple media items
 */
export async function getBatchMediaDetails(
  mediaType: MediaType,
  mediaIds: number[]
): Promise<{ [id: number]: MediaDetailsResponse }> {
  const detailsMap: { [id: number]: MediaDetailsResponse } = {};

  await Promise.all(
    mediaIds.map(async (id) => {
      try {
        const details = await getMediaDetails(mediaType, id);
        detailsMap[id] = details;
      } catch (error) {
        console.error(`Failed to fetch details for ${mediaType} ${id}:`, error);
        // Return empty details object for failed requests
        detailsMap[id] = { id };
      }
    })
  );

  return detailsMap;
}

/**
 * Fetch trending media with enriched details
 */
export async function getTrendingMediaWithDetails(
  mediaType: MediaType,
  timeWindow: "day" | "week" = "day",
  pages: number[] = [1, 2]
): Promise<MediaGridItem[]> {
  // First, get the trending media
  const mediaItems = await getTrendingMediaGrid(mediaType, timeWindow, pages);

  // Extract IDs for batch detail fetching
  const mediaIds = mediaItems.map((item) => item.id).filter(Boolean);

  // Fetch details for all media items
  const detailsMap = await getBatchMediaDetails(mediaType, mediaIds);

  // Merge details with media items
  return mediaItems.map((item) => ({
    ...item,
    runtime: detailsMap[item.id]?.runtime,
    number_of_seasons: detailsMap[item.id]?.number_of_seasons,
    number_of_episodes: detailsMap[item.id]?.number_of_episodes,
  }));
}
