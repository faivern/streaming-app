import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/watchProviders.api", () => ({
  getWatchProviders: vi.fn(),
  getWatchProviderRegions: vi.fn(),
}));
import { getWatchProviders } from "../../api/watchProviders.api";
import { useWatchProviders } from "./useWatchProviders";

const mockProviders = {
  id: 550,
  results: {
    US: {
      link: "https://example.com",
      flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/netflix.png", display_priority: 1 }],
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWatchProviders", () => {
  it("fetches watch providers for media", async () => {
    vi.mocked(getWatchProviders).mockResolvedValue(mockProviders);
    const { result } = renderHook(() => useWatchProviders("movie", 550), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProviders);
    expect(getWatchProviders).toHaveBeenCalledWith("movie", 550);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(
      () => useWatchProviders(undefined, undefined),
      { wrapper: createWrapper() }
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
