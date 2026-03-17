import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/advancedDiscover.api", () => ({
  getAdvancedDiscover: vi.fn(),
}));

import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import {
  useInfiniteAdvancedDiscover,
  infiniteAdvancedDiscoverKeys,
} from "./useInfiniteAdvancedDiscover";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useInfiniteAdvancedDiscover", () => {
  it("fetches first page", async () => {
    const mockPage = { page: 1, total_pages: 3, total_results: 60, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);
    const params = { mediaType: "movie" as const };
    const { result } = renderHook(() => useInfiniteAdvancedDiscover(params), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
  });

  it("can be disabled", () => {
    const params = { mediaType: "movie" as const };
    const { result } = renderHook(
      () => useInfiniteAdvancedDiscover(params, { enabled: false }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("passes page param to API call", async () => {
    const mockPage = { page: 1, total_pages: 2, total_results: 40, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);
    const params = { mediaType: "movie" as const, genreIds: [28] };

    const { result } = renderHook(() => useInfiniteAdvancedDiscover(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAdvancedDiscover).toHaveBeenCalledWith({
      ...params,
      page: 1, // initialPageParam
    });
  });

  it("hasNextPage is true when more pages exist", async () => {
    const mockPage = { page: 1, total_pages: 3, total_results: 60, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockPage);

    const { result } = renderHook(
      () => useInfiniteAdvancedDiscover({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it("hasNextPage is false on last page", async () => {
    const lastPage = { page: 3, total_pages: 3, total_results: 60, results: [{ id: 5 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(lastPage);

    const { result } = renderHook(
      () => useInfiniteAdvancedDiscover({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("query key includes filter params", () => {
    const params = { mediaType: "movie" as const, genreIds: [28, 12] };
    expect(infiniteAdvancedDiscoverKeys.filters(params)).toEqual([
      "infiniteAdvancedDiscover",
      params,
    ]);
  });
});
