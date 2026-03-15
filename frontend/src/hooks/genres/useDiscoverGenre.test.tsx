import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/genres.api", () => ({
  getDiscoverGenre: vi.fn(),
}));

import { getDiscoverGenre } from "../../api/genres.api";
import { useDiscoverGenre } from "./useDiscoverGenre";

describe("useDiscoverGenre", () => {
  it("fetches discover results for genre", async () => {
    const mockData = { page: 1, total_pages: 5, total_results: 100, results: [{ id: 1, title: "Movie" }] };
    vi.mocked(getDiscoverGenre).mockResolvedValue(mockData);
    const { result } = renderHook(
      () => useDiscoverGenre({ mediaType: "movie", genreId: 28 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results[0]).toHaveProperty("media_type", "movie");
  });

  it("disabled when genreId missing", () => {
    const { result } = renderHook(
      () => useDiscoverGenre({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
