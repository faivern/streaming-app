import api from "./http/axios";

export type WatchlistItem = {
  id: number;
  tmdbId: number;
  mediaType: string;
  title: string | null;
  posterPath: string | null;
  addedAt: string;
};

export type AddWatchlistRequest = {
  tmdbId: number;
  mediaType: string;
  title?: string;
  posterPath?: string;
};

export const watchlistApi = {
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const res = await api.get<WatchlistItem[]>("/api/watchlist");
    return res.data;
  },

  addToWatchlist: async (item: AddWatchlistRequest): Promise<WatchlistItem> => {
    const res = await api.post<WatchlistItem>("/api/watchlist", item);
    return res.data;
  },

  removeFromWatchlist: async (tmdbId: number, mediaType: string): Promise<void> => {
    await api.delete(`/api/watchlist/${tmdbId}/${mediaType}`);
  },

  checkInWatchlist: async (tmdbId: number, mediaType: string): Promise<boolean> => {
    const res = await api.get<{ inWatchlist: boolean }>(`/api/watchlist/check/${tmdbId}/${mediaType}`);
    return res.data.inWatchlist;
  },
};

export default watchlistApi;
