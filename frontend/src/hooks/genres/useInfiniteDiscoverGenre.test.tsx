import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/genres.api", () => ({
  getDiscoverGenre: vi.fn(),
}));

import { getDiscoverGenre } from "../../api/genres.api";
import { useInfiniteDiscoverGenre } from "./useInfiniteDiscoverGenre";

describe("useInfiniteDiscoverGenre", () => {
  it("fetches first page", async () => {
    const mockPage = { page: 1, total_pages: 3, total_results: 60, results: [{ id: 1 }] };
    vi.mocked(getDiscoverGenre).mockResolvedValue(mockPage);
    const { result } = renderHook(
      () => useInfiniteDiscoverGenre({ mediaType: "movie", genreId: 28 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(
      () => useInfiniteDiscoverGenre({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
