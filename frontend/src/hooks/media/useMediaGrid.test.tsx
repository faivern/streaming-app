import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../api/media.api", () => ({
  getTrendingMediaWithDetails: vi.fn(),
}));

import { getTrendingMediaWithDetails } from "../../api/media.api";
import type { DetailMediaGenre } from "../../types/tmdb";
import useMediaGrid from "./useMediaGrid";

describe("useMediaGrid", () => {
  it("starts with empty state", () => {
    const { result } = renderHook(() => useMediaGrid());
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetches media grid items", async () => {
    vi.mocked(getTrendingMediaWithDetails).mockResolvedValue([
      { id: 1, title: "Movie", media_type: "movie", overview: "", poster_path: null },
    ] as DetailMediaGenre[]);
    const { result } = renderHook(() => useMediaGrid());
    await act(async () => {
      await result.current.fetchMediaGrid("movie");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  it("handles fetch error", async () => {
    vi.mocked(getTrendingMediaWithDetails).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useMediaGrid());
    await act(async () => {
      await result.current.fetchMediaGrid("movie");
    });
    expect(result.current.error).toBe("Network error");
    expect(result.current.items).toEqual([]);
  });

  it("clearMedia resets state", async () => {
    vi.mocked(getTrendingMediaWithDetails).mockResolvedValue([
      { id: 1, overview: "", poster_path: null },
    ] as DetailMediaGenre[]);
    const { result } = renderHook(() => useMediaGrid());
    await act(async () => {
      await result.current.fetchMediaGrid("movie");
    });
    act(() => {
      result.current.clearMedia();
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
