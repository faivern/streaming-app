import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mediaEntriesApi,
  type CreateMediaEntryRequest,
  type UpdateMediaEntryRequest,
  type UpsertReviewRequest,
} from "../../api/mediaEntries.api";
import type { MediaEntry, WatchStatus } from "../../types/mediaEntry";

export const mediaEntryKeys = {
  all: ["mediaEntries"] as const,
  detail: (id: number) => ["mediaEntries", id] as const,
  byTmdb: (tmdbId: number, mediaType: string) =>
    ["mediaEntries", "tmdb", tmdbId, mediaType] as const,
};

/**
 * Fetch all media entries for the current user
 */
export function useMediaEntries() {
  return useQuery<MediaEntry[]>({
    queryKey: mediaEntryKeys.all,
    queryFn: mediaEntriesApi.getUserEntries,
  });
}

/**
 * Fetch media entries filtered by watch status
 */
export function useMediaEntriesByStatus(status: WatchStatus) {
  const { data, ...rest } = useMediaEntries();
  const filtered = data?.filter((entry) => entry.status === status);
  return { data: filtered, ...rest };
}

/**
 * Fetch a single media entry by ID
 */
export function useMediaEntry(id?: number) {
  return useQuery<MediaEntry>({
    queryKey: mediaEntryKeys.detail(id!),
    queryFn: () => mediaEntriesApi.getById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Fetch a media entry by TMDB ID and media type
 */
export function useMediaEntryByTmdb(tmdbId?: number, mediaType?: string) {
  return useQuery<MediaEntry>({
    queryKey: mediaEntryKeys.byTmdb(tmdbId!, mediaType!),
    queryFn: () => mediaEntriesApi.getByTmdbId(tmdbId!, mediaType!),
    enabled: Boolean(tmdbId) && Boolean(mediaType),
  });
}

/**
 * Create a new media entry
 */
export function useCreateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMediaEntryRequest) => mediaEntriesApi.create(data),
    onSuccess: (newEntry) => {
      queryClient.setQueryData<MediaEntry[]>(mediaEntryKeys.all, (old) =>
        old ? [...old, newEntry] : [newEntry]
      );
      queryClient.setQueryData(
        mediaEntryKeys.byTmdb(newEntry.tmdbId, newEntry.mediaType),
        newEntry
      );
    },
  });
}

/**
 * Update a media entry
 */
export function useUpdateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMediaEntryRequest }) =>
      mediaEntriesApi.update(id, data),
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData<MediaEntry[]>(mediaEntryKeys.all, (old) =>
        old?.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      queryClient.setQueryData(
        mediaEntryKeys.detail(updatedEntry.id),
        updatedEntry
      );
      queryClient.setQueryData(
        mediaEntryKeys.byTmdb(updatedEntry.tmdbId, updatedEntry.mediaType),
        updatedEntry
      );
    },
  });
}

/**
 * Delete a media entry
 */
export function useDeleteMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mediaEntriesApi.delete(id),
    onSuccess: (_, deletedId) => {
      const entry = queryClient.getQueryData<MediaEntry>(
        mediaEntryKeys.detail(deletedId)
      );
      queryClient.setQueryData<MediaEntry[]>(mediaEntryKeys.all, (old) =>
        old?.filter((e) => e.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: mediaEntryKeys.detail(deletedId) });
      if (entry) {
        queryClient.removeQueries({
          queryKey: mediaEntryKeys.byTmdb(entry.tmdbId, entry.mediaType),
        });
      }
    },
  });
}

/**
 * Upsert a review for a media entry
 */
export function useUpsertReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: number;
      data: UpsertReviewRequest;
    }) => mediaEntriesApi.upsertReview(entryId, data),
    onSuccess: (review, { entryId }) => {
      // Update the entry with the new review
      queryClient.setQueryData<MediaEntry[]>(mediaEntryKeys.all, (old) =>
        old?.map((entry) =>
          entry.id === entryId ? { ...entry, review } : entry
        )
      );
      queryClient.setQueryData<MediaEntry>(
        mediaEntryKeys.detail(entryId),
        (old) => (old ? { ...old, review } : old)
      );
    },
  });
}

/**
 * Delete a review for a media entry
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: number) => mediaEntriesApi.deleteReview(entryId),
    onSuccess: (_, entryId) => {
      queryClient.setQueryData<MediaEntry[]>(mediaEntryKeys.all, (old) =>
        old?.map((entry) =>
          entry.id === entryId ? { ...entry, review: null } : entry
        )
      );
      queryClient.setQueryData<MediaEntry>(
        mediaEntryKeys.detail(entryId),
        (old) => (old ? { ...old, review: null } : old)
      );
    },
  });
}

/**
 * Get counts per watch status
 */
export function useWatchStatusCounts() {
  const { data: entries } = useMediaEntries();

  if (!entries) {
    return {
      WantToWatch: 0,
      Watching: 0,
      Watched: 0,
      total: 0,
    };
  }

  return {
    WantToWatch: entries.filter((e) => e.status === "WantToWatch").length,
    Watching: entries.filter((e) => e.status === "Watching").length,
    Watched: entries.filter((e) => e.status === "Watched").length,
    total: entries.length,
  };
}
