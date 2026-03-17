import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";
import type { MediaEntry } from "../../types/mediaEntry";

vi.mock("../../api/mediaEntries.api", () => ({
  mediaEntriesApi: {
    getUserEntries: vi.fn(),
    getById: vi.fn(),
    getByTmdbId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsertReview: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

import { mediaEntriesApi } from "../../api/mediaEntries.api";
import {
  useMediaEntries,
  useMediaEntriesByStatus,
  useMediaEntry,
  useMediaEntryByTmdb,
  useCreateMediaEntry,
  useUpdateMediaEntry,
  useDeleteMediaEntry,
  useUpsertReview,
  useDeleteReview,
  useWatchStatusCounts,
  mediaEntryKeys,
} from "./useMediaEntries";

const makeMockEntry = (overrides: Partial<MediaEntry> = {}): MediaEntry => ({
  id: 1,
  userId: "user-1",
  tmdbId: 100,
  mediaType: "movie",
  title: "Test Movie",
  posterPath: "/poster.jpg",
  backdropPath: "/backdrop.jpg",
  overview: "A test movie",
  voteAverage: 7.5,
  runtime: 120,
  releaseDate: "2024-01-01",
  firstAirDate: undefined,
  numberOfSeasons: undefined,
  numberOfEpisodes: undefined,
  status: "Watched",
  ratingActing: null,
  ratingStory: null,
  ratingSoundtrack: null,
  ratingVisuals: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  watchedAt: null,
  review: null,
  ...overrides,
});

const mockEntries: MediaEntry[] = [
  makeMockEntry({ id: 1, tmdbId: 100, status: "Watched" }),
  makeMockEntry({ id: 2, tmdbId: 200, status: "Watching", mediaType: "tv", title: "Test Show" }),
  makeMockEntry({ id: 3, tmdbId: 300, status: "WantToWatch", title: "Upcoming Film" }),
  makeMockEntry({ id: 4, tmdbId: 400, status: "Watched", title: "Another Watched" }),
];

describe("useMediaEntries (lists/)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Query hooks ---

  describe("useMediaEntries", () => {
    it("fetches all user media entries", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue(mockEntries);

      const { result } = renderHook(() => useMediaEntries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEntries);
    });
  });

  describe("useMediaEntriesByStatus", () => {
    it("filters entries by Watched status", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue(mockEntries);

      const { result } = renderHook(
        () => useMediaEntriesByStatus("Watched"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.every((e) => e.status === "Watched")).toBe(true);
    });

    it("filters entries by Watching status", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue(mockEntries);

      const { result } = renderHook(
        () => useMediaEntriesByStatus("Watching"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
    });

    it("returns empty array when no entries match", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue([
        makeMockEntry({ status: "Watched" }),
      ]);

      const { result } = renderHook(
        () => useMediaEntriesByStatus("WantToWatch"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(0);
    });
  });

  describe("useMediaEntry", () => {
    it("fetches entry by id", async () => {
      const entry = makeMockEntry();
      vi.mocked(mediaEntriesApi.getById).mockResolvedValue(entry);

      const { result } = renderHook(() => useMediaEntry(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(entry);
      expect(mediaEntriesApi.getById).toHaveBeenCalledWith(1);
    });

    it("disabled when id is undefined", () => {
      const { result } = renderHook(() => useMediaEntry(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useMediaEntryByTmdb", () => {
    it("fetches entry by tmdbId and mediaType", async () => {
      const entry = makeMockEntry();
      vi.mocked(mediaEntriesApi.getByTmdbId).mockResolvedValue(entry);

      const { result } = renderHook(
        () => useMediaEntryByTmdb(100, "movie"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mediaEntriesApi.getByTmdbId).toHaveBeenCalledWith(100, "movie");
    });

    it("disabled when tmdbId is undefined", () => {
      const { result } = renderHook(
        () => useMediaEntryByTmdb(undefined, "movie"),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("disabled when mediaType is undefined", () => {
      const { result } = renderHook(
        () => useMediaEntryByTmdb(100, undefined),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  // --- Mutation hooks ---

  describe("useCreateMediaEntry", () => {
    it("calls create and returns new entry", async () => {
      const newEntry = makeMockEntry({ id: 10, tmdbId: 999 });
      vi.mocked(mediaEntriesApi.create).mockResolvedValue(newEntry);

      const { result } = renderHook(() => useCreateMediaEntry(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          tmdbId: 999,
          mediaType: "movie",
          status: "WantToWatch",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(newEntry);
      expect(mediaEntriesApi.create).toHaveBeenCalledWith({
        tmdbId: 999,
        mediaType: "movie",
        status: "WantToWatch",
      });
    });
  });

  describe("useUpdateMediaEntry", () => {
    it("calls update with id and data", async () => {
      const updated = makeMockEntry({ id: 1, status: "Watched" });
      vi.mocked(mediaEntriesApi.update).mockResolvedValue(updated);

      const { result } = renderHook(() => useUpdateMediaEntry(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ id: 1, data: { status: "Watched" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mediaEntriesApi.update).toHaveBeenCalledWith(1, { status: "Watched" });
    });
  });

  describe("useDeleteMediaEntry", () => {
    it("calls delete with id", async () => {
      vi.mocked(mediaEntriesApi.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMediaEntry(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mediaEntriesApi.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("useUpsertReview", () => {
    it("calls upsertReview with entryId and data", async () => {
      const review = {
        id: 1,
        mediaEntryId: 1,
        content: "Great movie!",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      vi.mocked(mediaEntriesApi.upsertReview).mockResolvedValue(review);

      const { result } = renderHook(() => useUpsertReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ entryId: 1, data: { content: "Great movie!" } });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mediaEntriesApi.upsertReview).toHaveBeenCalledWith(1, {
        content: "Great movie!",
      });
    });
  });

  describe("useDeleteReview", () => {
    it("calls deleteReview with entryId", async () => {
      vi.mocked(mediaEntriesApi.deleteReview).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteReview(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mediaEntriesApi.deleteReview).toHaveBeenCalledWith(1);
    });
  });

  // --- Derived hooks ---

  describe("useWatchStatusCounts", () => {
    it("returns counts per status", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue(mockEntries);

      const { result } = renderHook(() => useWatchStatusCounts(), {
        wrapper: createWrapper(),
      });

      // Wait for the underlying useMediaEntries query to resolve
      await waitFor(() => expect(result.current.total).toBe(4));

      expect(result.current.Watched).toBe(2);
      expect(result.current.Watching).toBe(1);
      expect(result.current.WantToWatch).toBe(1);
    });

    it("returns all zeros when no entries loaded", () => {
      // Don't mock — query hasn't resolved yet, data is undefined
      const { result } = renderHook(() => useWatchStatusCounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toEqual({
        WantToWatch: 0,
        Watching: 0,
        Watched: 0,
        total: 0,
      });
    });
  });

  // --- Query key factory ---

  describe("mediaEntryKeys", () => {
    it("all returns base key", () => {
      expect(mediaEntryKeys.all).toEqual(["mediaEntries"]);
    });

    it("detail includes id", () => {
      expect(mediaEntryKeys.detail(5)).toEqual(["mediaEntries", 5]);
    });

    it("byTmdb includes tmdbId and mediaType", () => {
      expect(mediaEntryKeys.byTmdb(100, "movie")).toEqual([
        "mediaEntries",
        "tmdb",
        100,
        "movie",
      ]);
    });
  });
});
