import api from "./http/axios";
import type { MediaEntry, Review, WatchStatus } from "../types/mediaEntry";

export type CreateMediaEntryRequest = {
  tmdbId: number;
  mediaType: string;
  title?: string;
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  voteAverage?: number;
  status: WatchStatus;
};

export type UpdateMediaEntryRequest = {
  status?: WatchStatus;
  ratingActing?: number;
  ratingStory?: number;
  ratingSoundtrack?: number;
  ratingVisuals?: number;
  watchedAt?: string;
};

export type UpsertReviewRequest = {
  content: string;
};

export const mediaEntriesApi = {
  getUserEntries: async (): Promise<MediaEntry[]> => {
    const res = await api.get<MediaEntry[]>("/api/media-entries");
    return res.data;
  },

  getById: async (id: number): Promise<MediaEntry> => {
    const res = await api.get<MediaEntry>(`/api/media-entries/${id}`);
    return res.data;
  },

  getByTmdbId: async (tmdbId: number, mediaType: string): Promise<MediaEntry> => {
    const res = await api.get<MediaEntry>(`/api/media-entries/tmdb/${tmdbId}/${mediaType}`);
    return res.data;
  },

  create: async (data: CreateMediaEntryRequest): Promise<MediaEntry> => {
    const res = await api.post<MediaEntry>("/api/media-entries", data);
    return res.data;
  },

  update: async (id: number, data: UpdateMediaEntryRequest): Promise<MediaEntry> => {
    const res = await api.put<MediaEntry>(`/api/media-entries/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/media-entries/${id}`);
  },

  upsertReview: async (entryId: number, data: UpsertReviewRequest): Promise<Review> => {
    const res = await api.put<Review>(`/api/media-entries/${entryId}/review`, data);
    return res.data;
  },

  deleteReview: async (entryId: number): Promise<void> => {
    await api.delete(`/api/media-entries/${entryId}/review`);
  },
};

export default mediaEntriesApi;
