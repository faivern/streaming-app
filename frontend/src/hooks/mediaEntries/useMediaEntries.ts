import { useQuery } from "@tanstack/react-query";
import { mediaEntriesApi } from "../../api/mediaEntries.api";
import type { MediaEntry } from "../../types/mediaEntry";
import { useUser } from "../user/useUser";

export function useUserMediaEntries() {
  const { data: user } = useUser();
  return useQuery<MediaEntry[]>({
    queryKey: ["mediaEntries"],
    queryFn: mediaEntriesApi.getUserEntries,
    enabled: !!user,
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
  const { data: user } = useUser();
  return useQuery<MediaEntry>({
    queryKey: ["mediaEntries", "tmdb", tmdbId, mediaType],
    queryFn: () => mediaEntriesApi.getByTmdbId(tmdbId!, mediaType!),
    enabled: Boolean(tmdbId && mediaType) && !!user,
    retry: false,
  });
}
