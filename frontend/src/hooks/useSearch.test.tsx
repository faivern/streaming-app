import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("../api/http/axios", () => ({
  api: { get: vi.fn() },
}));

import { api } from "../api/http/axios";
import { useSearch } from "./useSearch";

// Mock axios.isCancel and axios.isAxiosError
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      isCancel: vi.fn(() => false),
      isAxiosError: vi.fn(() => false),
    },
    isCancel: vi.fn(() => false),
    isAxiosError: vi.fn(() => false),
  };
});

const mockSearchResponse = {
  data: {
    results: [
      { id: 1, media_type: "movie" as const, title: "Test Movie" },
      { id: 2, media_type: "tv" as const, name: "Test Show" },
    ],
    total_pages: 3,
    total_results: 50,
    page: 1,
  },
};

describe("useSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalResults).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.currentPage).toBe(0);
  });

  it("resets state and does not call API for empty query", async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("   ");
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it("updates results on successful search", async () => {
    vi.mocked(api.get).mockResolvedValue(mockSearchResponse);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(api.get).toHaveBeenCalledWith("/api/Movies/search/multi", {
      params: { query: "test", page: 1 },
      signal: expect.any(AbortSignal),
    });
    expect(result.current.results).toEqual(mockSearchResponse.data.results);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalResults).toBe(50);
    expect(result.current.hasSearched).toBe(true);
  });

  it("sets loading during search", async () => {
    let resolvePromise: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(api.get).mockReturnValue(pending as ReturnType<typeof api.get>);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.search("test");
    });

    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolvePromise!(mockSearchResponse);
    });

    expect(result.current.loading).toBe(false);
  });

  it("handles generic API error", async () => {
    const error = new Error("Network fail");
    vi.mocked(api.get).mockRejectedValue(error);
    vi.mocked(axios.isCancel).mockReturnValue(false);
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.error).toBe("Something went wrong with the search.");
    expect(result.current.hasSearched).toBe(true);
  });

  it("handles 404 error message", async () => {
    const error = { response: { status: 404 }, isAxiosError: true };
    vi.mocked(api.get).mockRejectedValue(error);
    vi.mocked(axios.isCancel).mockReturnValue(false);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.error).toBe("Search service not found.");
  });

  it("handles 500 error message", async () => {
    const error = { response: { status: 500 }, isAxiosError: true };
    vi.mocked(api.get).mockRejectedValue(error);
    vi.mocked(axios.isCancel).mockReturnValue(false);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.error).toBe("Server error. Please try again later.");
  });

  it("clearSearch resets all state", async () => {
    vi.mocked(api.get).mockResolvedValue(mockSearchResponse);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.results.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.totalResults).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.currentPage).toBe(0);
  });

  it("clearError clears only error", async () => {
    const error = new Error("fail");
    vi.mocked(api.get).mockRejectedValue(error);
    vi.mocked(axios.isCancel).mockReturnValue(false);
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.hasSearched).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasSearched).toBe(true);
  });

  it("computes hasNextPage correctly", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        results: [{ id: 1, media_type: "movie", title: "A" }],
        total_pages: 3,
        total_results: 50,
        page: 1,
      },
    });

    const { result } = renderHook(() => useSearch());

    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.search("test");
    });

    // currentPage=1, totalPages=3 => hasNextPage=true
    expect(result.current.hasNextPage).toBe(true);

    // Simulate being on last page
    vi.mocked(api.get).mockResolvedValue({
      data: {
        results: [{ id: 3, media_type: "movie", title: "C" }],
        total_pages: 3,
        total_results: 50,
        page: 3,
      },
    });

    await act(async () => {
      await result.current.search("test", 3);
    });

    expect(result.current.hasNextPage).toBe(false);
  });
});
