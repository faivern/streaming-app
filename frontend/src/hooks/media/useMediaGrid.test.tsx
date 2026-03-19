import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/media.api", () => ({
  getTrendingMediaGrid: vi.fn(),
}));

import { getTrendingMediaGrid } from "../../api/media.api";
import type { DetailMediaGenre } from "../../types/tmdb";
import useMediaGrid from "./useMediaGrid";

describe("useMediaGrid", () => {
  it("fetches trending movies", async () => {
    vi.mocked(getTrendingMediaGrid).mockResolvedValue([
      { id: 1, title: "Movie", media_type: "movie", overview: "", poster_path: null },
    ] as DetailMediaGenre[]);
    const { result } = renderHook(() => useMediaGrid("movie"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(getTrendingMediaGrid).toHaveBeenCalledWith("movie", "day", [1, 2]);
  });

  it("fetches trending TV shows", async () => {
    vi.mocked(getTrendingMediaGrid).mockResolvedValue([
      { id: 2, name: "TV Show", media_type: "tv", overview: "", poster_path: null },
    ] as DetailMediaGenre[]);
    const { result } = renderHook(() => useMediaGrid("tv"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTrendingMediaGrid).toHaveBeenCalledWith("tv", "day", [1, 2]);
  });

  it("handles fetch error", async () => {
    vi.mocked(getTrendingMediaGrid).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useMediaGrid("movie"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network error");
  });
});
