import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createWrapper } from "../test/queryWrapper";

vi.mock("../api/watchlist.api", () => ({
  default: { addToWatchlist: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import watchlistApi from "../api/watchlist.api";
import toast from "react-hot-toast";
import useAddWatchList from "./useAddWatchList";

const mockItem = { tmdbId: 123, mediaType: "movie", title: "Test" };

describe("useAddWatchList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls watchlistApi.addToWatchlist on mutate", async () => {
    vi.mocked(watchlistApi.addToWatchlist).mockResolvedValue({
      id: 1,
      tmdbId: 123,
      mediaType: "movie",
      title: "Test",
      posterPath: null,
      addedAt: "2024-01-01",
    });

    const { result } = renderHook(() => useAddWatchList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current(mockItem);
    });

    await waitFor(() => {
      expect(watchlistApi.addToWatchlist).toHaveBeenCalledWith(mockItem);
    });
  });

  it("shows success toast on success", async () => {
    vi.mocked(watchlistApi.addToWatchlist).mockResolvedValue({
      id: 1,
      tmdbId: 123,
      mediaType: "movie",
      title: "Test",
      posterPath: null,
      addedAt: "2024-01-01",
    });

    const { result } = renderHook(() => useAddWatchList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current(mockItem);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Added to Watchlist!");
    });
  });

  it("shows 'Already in your watchlist' on 409", async () => {
    const error = Object.assign(new Error("Conflict"), {
      response: { status: 409 },
    });
    vi.mocked(watchlistApi.addToWatchlist).mockRejectedValue(error);

    const { result } = renderHook(() => useAddWatchList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current(mockItem);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Already in your watchlist");
    });
  });

  it("shows 'Please sign in' on 401", async () => {
    const error = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    vi.mocked(watchlistApi.addToWatchlist).mockRejectedValue(error);

    const { result } = renderHook(() => useAddWatchList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current(mockItem);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please sign in to use watchlist"
      );
    });
  });
});
