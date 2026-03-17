import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/advancedDiscover.api", () => ({
  getAdvancedDiscover: vi.fn(),
}));

import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import { useAdvancedDiscover } from "./useAdvancedDiscover";

describe("useAdvancedDiscover", () => {
  it("fetches advanced discover results", async () => {
    const mockData = { page: 1, total_pages: 5, total_results: 100, results: [{ id: 1 }] };
    vi.mocked(getAdvancedDiscover).mockResolvedValue(mockData);
    const params = { mediaType: "movie" as const, page: 1 };
    const { result } = renderHook(() => useAdvancedDiscover(params), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("can be disabled via options", () => {
    const params = { mediaType: "movie" as const, page: 1 };
    const { result } = renderHook(
      () => useAdvancedDiscover(params, { enabled: false }),
      { wrapper: createWrapper() },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
