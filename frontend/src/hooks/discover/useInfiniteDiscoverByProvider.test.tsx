import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/advancedDiscover.api", () => ({
  getAdvancedDiscover: vi.fn(),
}));

import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import { useInfiniteDiscoverByProvider } from "./useInfiniteDiscoverByProvider";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useInfiniteDiscoverByProvider", () => {
  it("fetches discover by provider", async () => {
    const mockPage = { page: 1, total_pages: 3, total_results: 60, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);
    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
  });

  it("disabled when providerId missing", () => {
    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("disabled when mediaType missing", () => {
    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8 }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("select injects media_type into each result", async () => {
    const mockPage = {
      page: 1,
      total_pages: 1,
      total_results: 2,
      results: [
        { id: 1, title: "Movie A" },
        { id: 2, title: "Movie B" },
      ],
    };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The select transform adds media_type to every result
    const results = result.current.data!.pages[0].results;
    expect(results[0]).toHaveProperty("media_type", "movie");
    expect(results[1]).toHaveProperty("media_type", "movie");
  });

  it("select injects tv media_type for tv queries", async () => {
    const mockPage = {
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [{ id: 10, name: "TV Show" }],
    };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "tv" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.pages[0].results[0]).toHaveProperty("media_type", "tv");
  });

  it("passes default watchRegion and sortBy", async () => {
    const mockPage = { page: 1, total_pages: 1, total_results: 0, results: [] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(getAdvancedDiscover).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaType: "movie",
          withWatchProviders: 8,
          watchRegion: "US",
          sortBy: "popularity.desc",
          page: 1,
        }),
      );
    });
  });

  it("uses custom watchRegion and sortBy", async () => {
    const mockPage = { page: 1, total_pages: 1, total_results: 0, results: [] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    renderHook(
      () =>
        useInfiniteDiscoverByProvider({
          providerId: 8,
          mediaType: "movie",
          watchRegion: "GB",
          sortBy: "vote_average.desc",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(getAdvancedDiscover).toHaveBeenCalledWith(
        expect.objectContaining({
          watchRegion: "GB",
          sortBy: "vote_average.desc",
        }),
      );
    });
  });

  it("hasNextPage is true when more pages exist", async () => {
    const mockPage = { page: 1, total_pages: 5, total_results: 100, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it("hasNextPage is false on last page", async () => {
    const lastPage = { page: 2, total_pages: 2, total_results: 40, results: [{ id: 3 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(lastPage);

    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("handles empty results array gracefully in select", async () => {
    const mockPage = { page: 1, total_pages: 1, total_results: 0, results: undefined as never };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    const { result } = renderHook(
      () => useInfiniteDiscoverByProvider({ providerId: 8, mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // select uses `(page.results ?? [])` so undefined results → empty array
    expect(result.current.data!.pages[0].results).toEqual([]);
  });
});
