import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/trending.api", () => ({
  getTrendingMediaPaged: vi.fn(),
}));

import { getTrendingMediaPaged } from "../../api/trending.api";
import { useInfiniteTrending } from "./useInfiniteTrending";

describe("useInfiniteTrending", () => {
  it("fetches first page of trending", async () => {
    const mockPage = { page: 1, total_pages: 5, total_results: 100, results: [{ id: 1 }] };
    vi.mocked(getTrendingMediaPaged).mockResolvedValue(mockPage);
    const { result } = renderHook(
      () => useInfiniteTrending({ mediaType: "movie" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
  });

  it("can be disabled", () => {
    const { result } = renderHook(
      () => useInfiniteTrending({ mediaType: "movie" }, { enabled: false }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
