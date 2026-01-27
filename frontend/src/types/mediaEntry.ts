export type Review = {
  id: number;
  mediaEntryId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type WatchStatus = "WantToWatch" | "Watching" | "Watched";

export type MediaEntry = {
  id: number;
  userId: string;
  tmdbId: number;
  mediaType: string;
  title: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string | null;
  voteAverage: number | null;
  status: WatchStatus;
  ratingActing: number | null;
  ratingStory: number | null;
  ratingSoundtrack: number | null;
  ratingVisuals: number | null;
  createdAt: string;
  updatedAt: string;
  watchedAt: string | null;
  review: Review | null;
};
