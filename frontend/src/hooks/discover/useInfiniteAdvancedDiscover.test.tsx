import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/advancedDiscover.api", () => ({
  getAdvancedDiscover: vi.fn(),
}));

import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import { useInfiniteAdvancedDiscover } from "./useInfiniteAdvancedDiscover";

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
});
