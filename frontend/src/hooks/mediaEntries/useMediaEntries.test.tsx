import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/mediaEntries.api", () => ({
  mediaEntriesApi: {
    getUserEntries: vi.fn(),
    getById: vi.fn(),
    getByTmdbId: vi.fn(),
  },
}));

import { mediaEntriesApi } from "../../api/mediaEntries.api";
import {
  useUserMediaEntries,
  useMediaEntryById,
  useMediaEntryByTmdbId,
} from "./useMediaEntries";

const mockEntries = [
  {
    id: 1,
    tmdbId: 100,
    mediaType: "movie",
    title: "Test Movie",
    status: "Watched",
  },
  {
    id: 2,
    tmdbId: 200,
    mediaType: "tv",
    title: "Test Show",
    status: "Watching",
  },
] as any;

const mockEntry = mockEntries[0];

describe("useMediaEntries (mediaEntries/)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useUserMediaEntries", () => {
    it("fetches all user media entries", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockResolvedValue(mockEntries);

      const { result } = renderHook(() => useUserMediaEntries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEntries);
      expect(mediaEntriesApi.getUserEntries).toHaveBeenCalledOnce();
    });

    it("handles error", async () => {
      vi.mocked(mediaEntriesApi.getUserEntries).mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useUserMediaEntries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe("useMediaEntryById", () => {
    it("fetches entry by id", async () => {
      vi.mocked(mediaEntriesApi.getById).mockResolvedValue(mockEntry);

      const { result } = renderHook(() => useMediaEntryById(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEntry);
      expect(mediaEntriesApi.getById).toHaveBeenCalledWith(1);
    });

    it("disabled when id is undefined", () => {
      const { result } = renderHook(() => useMediaEntryById(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mediaEntriesApi.getById).not.toHaveBeenCalled();
    });

    it("disabled when id is 0 (falsy)", () => {
      const { result } = renderHook(() => useMediaEntryById(0), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
    });
  });

  describe("useMediaEntryByTmdbId", () => {
    it("fetches entry by tmdb id and media type", async () => {
      vi.mocked(mediaEntriesApi.getByTmdbId).mockResolvedValue(mockEntry);

      const { result } = renderHook(
        () => useMediaEntryByTmdbId(100, "movie"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEntry);
      expect(mediaEntriesApi.getByTmdbId).toHaveBeenCalledWith(100, "movie");
    });

    it("disabled when tmdbId is undefined", () => {
      const { result } = renderHook(
        () => useMediaEntryByTmdbId(undefined, "movie"),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("disabled when mediaType is undefined", () => {
      const { result } = renderHook(
        () => useMediaEntryByTmdbId(100, undefined),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("disabled when both params are undefined", () => {
      const { result } = renderHook(
        () => useMediaEntryByTmdbId(undefined, undefined),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("has retry disabled", async () => {
      vi.mocked(mediaEntriesApi.getByTmdbId).mockRejectedValue(
        new Error("Not found"),
      );

      const { result } = renderHook(
        () => useMediaEntryByTmdbId(100, "movie"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      // retry: false means only one call
      expect(mediaEntriesApi.getByTmdbId).toHaveBeenCalledTimes(1);
    });
  });
});
