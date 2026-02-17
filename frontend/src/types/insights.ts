import type { ListItem } from "./list";
import type { DetailMedia, CreditsResponse, Credit } from "./tmdb";
import type { MediaEntry } from "./mediaEntry";

// Enriched type for aggregation operations
export type EnrichedListItem = ListItem & {
  details?: DetailMedia;
  credits?: CreditsResponse;
};

// Genre distribution metric
export type GenreDistribution = {
  name: string;
  value: number;
  percentage: number;
};

// Top person metric (actors/directors)
export type TopPerson = {
  id: number;
  name: string;
  profilePath: string | null;
  count: number;
  roles: Array<{
    title: string;
    character?: string;
    job?: string;
  }>;
};

// Rating comparison metric
export type RatingComparison = {
  userAverage: number;
  tmdbAverage: number;
  difference: number;
  itemCount: number;
};

// Most active month metric
export type ActiveMonth = {
  monthKey: string;
  year: number;
  count: number;
  displayName: string;
};

// Release year/decade breakdown metric
export type ReleaseYearBreakdown = {
  year: number;
  decade: string;
  count: number;
};

// Complete insights object
export type ListInsights = {
  totalCount: number;
  genreDistribution: GenreDistribution[];
  topGenres: GenreDistribution[];
  topActors: TopPerson[];
  topDirectors: TopPerson[];
  ratingComparison: RatingComparison;
  mostActiveMonth: ActiveMonth | null;
  releaseYearBreakdown: ReleaseYearBreakdown[];
};

// Re-export types needed by aggregators
export type { ListItem, DetailMedia, CreditsResponse, Credit, MediaEntry };
