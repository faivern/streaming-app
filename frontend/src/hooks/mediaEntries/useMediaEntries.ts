import { useQuery } from "@tanstack/react-query";
import { mediaEntriesApi } from "../../api/mediaEntries.api";
import type { MediaEntry } from "../../types/mediaEntry";

export function useUserMediaEntries() {
  return useQuery<MediaEntry[]>({
    queryKey: ["mediaEntries"],
    queryFn: mediaEntriesApi.getUserEntries,
  });
}

export function useMediaEntryById(id?: number) {
  return useQuery<MediaEntry>({
    queryKey: ["mediaEntries", id],
    queryFn: () => mediaEntriesApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useMediaEntryByTmdbId(tmdbId?: number, mediaType?: string) {
  return useQuery<MediaEntry>({
    queryKey: ["mediaEntries", "tmdb", tmdbId, mediaType],
    queryFn: () => mediaEntriesApi.getByTmdbId(tmdbId!, mediaType!),
    enabled: Boolean(tmdbId && mediaType),
    retry: false,
  });
}
