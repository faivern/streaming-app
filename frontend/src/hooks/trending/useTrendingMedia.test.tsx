import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/trending.api", () => ({ getTrendingMedia: vi.fn() }));
import { getTrendingMedia } from "../../api/trending.api";
import { useTrendingMedia } from "./useTrendingMedia";

const mockData = [
  { id: 1, title: "Trending Movie", media_type: "movie" as const },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTrendingMedia", () => {
  it("fetches trending media with default params", async () => {
    vi.mocked(getTrendingMedia).mockResolvedValue(mockData);
    const { result } = renderHook(() => useTrendingMedia(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(getTrendingMedia).toHaveBeenCalledWith("all", "day", 1, "en-US");
  });

  it("passes custom params correctly", async () => {
    vi.mocked(getTrendingMedia).mockResolvedValue(mockData);
    const { result } = renderHook(
      () => useTrendingMedia("movie", "week", 2, "es-ES"),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTrendingMedia).toHaveBeenCalledWith("movie", "week", 2, "es-ES");
  });
});
