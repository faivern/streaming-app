import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/advancedDiscover.api", () => ({
  getAdvancedDiscover: vi.fn(),
}));

import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import { useInfiniteDiscoverByProvider } from "./useInfiniteDiscoverByProvider";

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
});
