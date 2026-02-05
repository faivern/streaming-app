import type { ListItem } from "./list";
import type { MediaEntry, WatchStatus } from "./mediaEntry";

/**
 * Unified display item that normalizes both ListItem and MediaEntry
 * for consistent rendering in grid/list views
 */
export type DisplayItem = {
  id: number;
  tmdbId: number;
  mediaType: string;
  runtime?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  releaseDate?: string;
  firstAirDate?: string;
  title: string;
  posterPath: string | null;
  addedAt: string;
  status?: WatchStatus;
  voteAverage?: number | null;
  ratingActing?: number | null;
  ratingStory?: number | null;
  ratingSoundtrack?: number | null;
  ratingVisuals?: number | null;
  overview?: string | null;
  backdropPath?: string | null;
  review?: { content: string } | null;
  source: "list" | "entry";
  sourceId: number;
};

/**
 * Convert a ListItem to a DisplayItem
 */
export function listItemToDisplayItem(item: ListItem): DisplayItem {
  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title || "Untitled",
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    overview: item.overview,
    voteAverage: item.voteAverage,
    addedAt: item.addedAt,
    source: "list",
    sourceId: item.listId,
    runtime: item.runtime,
    numberOfSeasons: item.numberOfSeasons,
    numberOfEpisodes: item.numberOfEpisodes,
    releaseDate: item.releaseDate,
    firstAirDate: item.firstAirDate,
  };
}

/**
 * Convert a MediaEntry to a DisplayItem
 */
export function mediaEntryToDisplayItem(entry: MediaEntry): DisplayItem {
  return {
    id: entry.id,
    tmdbId: entry.tmdbId,
    mediaType: entry.mediaType,
    title: entry.title || "Untitled",
    posterPath: entry.posterPath,
    addedAt: entry.createdAt,
    status: entry.status,
    voteAverage: entry.voteAverage,
    ratingActing: entry.ratingActing,
    ratingStory: entry.ratingStory,
    ratingSoundtrack: entry.ratingSoundtrack,
    ratingVisuals: entry.ratingVisuals,
    overview: entry.overview,
    backdropPath: entry.backdropPath,
    review: entry.review,
    source: "entry",
    sourceId: entry.id,
    runtime: entry.runtime,
    numberOfSeasons: entry.numberOfSeasons,
    numberOfEpisodes: entry.numberOfEpisodes,
    releaseDate: entry.releaseDate,
    firstAirDate: entry.firstAirDate,
  };
}

/**
 * Calculate average user rating from individual category ratings
 */
export function calculateAverageRating(item: DisplayItem): number | null {
  const ratings = [
    item.ratingActing,
    item.ratingStory,
    item.ratingSoundtrack,
    item.ratingVisuals,
  ].filter((r): r is number => r !== null && r !== undefined);

  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

export type ListsSortOption =
  | "date-added"
  | "your-rating"
  | "title-asc"
  | "title-desc"
  | "newest"
  | "oldest";

export type ViewMode = "grid" | "list";

export type ActiveView = "status" | "list";
