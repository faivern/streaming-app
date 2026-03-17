import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("./useGenres", () => ({
  useGenres: vi.fn(),
}));

vi.mock("../../api/genres.api", () => ({
  getDiscoverGenre: vi.fn(),
}));

import { useGenres } from "./useGenres";
import { getDiscoverGenre } from "../../api/genres.api";
import { useGenresWithBackdrops } from "./useGenresWithBackdrops";

const mockGenres = [
  { id: 28, name: "Action", supportedMediaTypes: ["movie"] },
  { id: 35, name: "Comedy", supportedMediaTypes: ["movie"] },
  { id: 18, name: "Drama", supportedMediaTypes: ["tv"] },
];

function makeDiscoverResult(items: Array<{ id: number; backdrop_path?: string | null; vote_average?: number; vote_count?: number }>) {
  return { page: 1, total_pages: 1, total_results: items.length, results: items };
}

describe("useGenresWithBackdrops", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disabled when genres are not loaded", () => {
    vi.mocked(useGenres).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useGenres>);

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("disabled when genres array is empty", () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useGenres>);

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("assigns unique backdrops from Bayesian-sorted candidates", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: mockGenres,
    } as unknown as ReturnType<typeof useGenres>);

    // Each genre gets different discover results with distinct backdrops
    vi.mocked(getDiscoverGenre)
      .mockResolvedValueOnce(
        makeDiscoverResult([
          { id: 1, backdrop_path: "/action1.jpg", vote_average: 8.0, vote_count: 20000 },
          { id: 2, backdrop_path: "/action2.jpg", vote_average: 7.5, vote_count: 15000 },
        ]),
      )
      .mockResolvedValueOnce(
        makeDiscoverResult([
          { id: 3, backdrop_path: "/comedy1.jpg", vote_average: 7.0, vote_count: 18000 },
        ]),
      )
      .mockResolvedValueOnce(
        makeDiscoverResult([
          { id: 4, backdrop_path: "/drama1.jpg", vote_average: 8.5, vote_count: 25000 },
        ]),
      );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data).toHaveLength(3);

    // All backdrops should be unique
    const backdrops = data.map((g) => g.backdropPath).filter(Boolean);
    expect(new Set(backdrops).size).toBe(backdrops.length);
  });

  it("deduplicates backdrops across genres", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: mockGenres.slice(0, 2), // Action + Comedy
    } as unknown as ReturnType<typeof useGenres>);

    // Both genres return the same top backdrop
    const sharedItems = [
      { id: 1, backdrop_path: "/shared.jpg", vote_average: 9.0, vote_count: 50000 },
      { id: 2, backdrop_path: "/fallback.jpg", vote_average: 7.0, vote_count: 10000 },
    ];
    vi.mocked(getDiscoverGenre)
      .mockResolvedValueOnce(makeDiscoverResult(sharedItems))
      .mockResolvedValueOnce(makeDiscoverResult(sharedItems));

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const backdrops = result.current.data!.map((g) => g.backdropPath);
    // First genre gets /shared.jpg, second gets /fallback.jpg (deduped)
    expect(backdrops[0]).toBe("/shared.jpg");
    expect(backdrops[1]).toBe("/fallback.jpg");
  });

  it("filters out items below vote_count threshold (100)", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [mockGenres[0]], // Action only
    } as unknown as ReturnType<typeof useGenres>);

    vi.mocked(getDiscoverGenre).mockResolvedValue(
      makeDiscoverResult([
        { id: 1, backdrop_path: "/low.jpg", vote_average: 9.5, vote_count: 50 }, // Below 100 threshold
        { id: 2, backdrop_path: "/high.jpg", vote_average: 6.0, vote_count: 200 },
      ]),
    );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Should pick /high.jpg since /low.jpg is filtered by vote_count < 100
    expect(result.current.data![0].backdropPath).toBe("/high.jpg");
  });

  it("falls back to vote_count sort when no items pass Bayesian filter", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [mockGenres[0]],
    } as unknown as ReturnType<typeof useGenres>);

    // All items below vote_count 100 threshold for Bayesian, but have backdrops
    vi.mocked(getDiscoverGenre).mockResolvedValue(
      makeDiscoverResult([
        { id: 1, backdrop_path: "/a.jpg", vote_average: 8.0, vote_count: 50 },
        { id: 2, backdrop_path: "/b.jpg", vote_average: 7.0, vote_count: 80 },
      ]),
    );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Fallback sorts by vote_count desc, so /b.jpg (80) wins
    expect(result.current.data![0].backdropPath).toBe("/b.jpg");
  });

  it("uses hardcoded fallback for Music genre (10402)", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [{ id: 10402, name: "Music", supportedMediaTypes: ["movie"] }],
    } as unknown as ReturnType<typeof useGenres>);

    // Empty discover results
    vi.mocked(getDiscoverGenre).mockResolvedValue(
      makeDiscoverResult([]),
    );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].backdropPath).toBe(
      "/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg",
    );
  });

  it("sets null backdrop when no candidates and no fallback", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [mockGenres[0]],
    } as unknown as ReturnType<typeof useGenres>);

    vi.mocked(getDiscoverGenre).mockResolvedValue(
      makeDiscoverResult([]),
    );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].backdropPath).toBeNull();
  });

  it("handles discover API failure gracefully", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [mockGenres[0]],
    } as unknown as ReturnType<typeof useGenres>);

    vi.mocked(getDiscoverGenre).mockRejectedValue(new Error("API down"));

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // fetchDiscoverResults catches errors and returns [], so backdrop is null
    expect(result.current.data![0].backdropPath).toBeNull();
  });

  it("uses tv mediaType for tv-only genres", async () => {
    vi.mocked(useGenres).mockReturnValue({
      data: [{ id: 18, name: "Drama", supportedMediaTypes: ["tv"] }],
    } as unknown as ReturnType<typeof useGenres>);

    vi.mocked(getDiscoverGenre).mockResolvedValue(
      makeDiscoverResult([
        { id: 1, backdrop_path: "/drama.jpg", vote_average: 8.0, vote_count: 20000 },
      ]),
    );

    const { result } = renderHook(() => useGenresWithBackdrops(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getDiscoverGenre).toHaveBeenCalledWith({
      genreId: 18,
      mediaType: "tv",
      page: 1,
    });
  });
});
