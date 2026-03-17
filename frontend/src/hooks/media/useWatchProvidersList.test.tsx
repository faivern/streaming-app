import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/watchProviders.api", () => ({
  getMovieWatchProvidersList: vi.fn(),
  getTvWatchProvidersList: vi.fn(),
}));

import { getMovieWatchProvidersList, getTvWatchProvidersList } from "../../api/watchProviders.api";
import { useWatchProvidersList } from "./useWatchProvidersList";

describe("useWatchProvidersList", () => {
  it("merges and deduplicates movie + TV providers", async () => {
    vi.mocked(getMovieWatchProvidersList).mockResolvedValue({
      results: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/netflix.png", display_priority: 1, display_priorities: {} },
        { provider_id: 100, provider_name: "Other", logo_path: "/other.png", display_priority: 10, display_priorities: {} },
      ],
    });
    vi.mocked(getTvWatchProvidersList).mockResolvedValue({
      results: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/netflix.png", display_priority: 1, display_priorities: {} },
        { provider_id: 200, provider_name: "TVOnly", logo_path: "/tv.png", display_priority: 5, display_priorities: {} },
      ],
    });
    const { result } = renderHook(() => useWatchProvidersList("US"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Netflix (priority), then TVOnly and Other sorted by display_priority
    expect(result.current.data?.[0].provider_name).toBe("Netflix");
    // 3 unique providers: Netflix (deduped), Other, TVOnly
    expect(result.current.data).toHaveLength(3);
  });
});
