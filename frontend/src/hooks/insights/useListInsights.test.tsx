import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../lists/useLists", () => ({
  useListById: vi.fn(),
}));

vi.mock("../lists/useMediaEntries", () => ({
  useMediaEntries: vi.fn(),
}));

vi.mock("../../api/media.api", () => ({
  getMediaDetails: vi.fn(),
}));

vi.mock("../../api/credit.api", () => ({
  getMediaCredits: vi.fn(),
}));

vi.mock("../../lib/insights/aggregators", () => ({
  computeGenreDistribution: vi.fn(),
  getTopGenres: vi.fn(),
  computeTopActors: vi.fn(),
  computeTopDirectors: vi.fn(),
  computeRatingComparison: vi.fn(),
  computeMostActiveMonth: vi.fn(),
  computeReleaseYearBreakdown: vi.fn(),
  computeTopRatedTitles: vi.fn(),
}));

import { useListById } from "../lists/useLists";
import { useMediaEntries } from "../lists/useMediaEntries";
import { getMediaDetails } from "../../api/media.api";
import { getMediaCredits } from "../../api/credit.api";
import {
  computeGenreDistribution,
  getTopGenres,
  computeTopActors,
  computeTopDirectors,
  computeRatingComparison,
  computeMostActiveMonth,
  computeReleaseYearBreakdown,
  computeTopRatedTitles,
} from "../../lib/insights/aggregators";
import { useListInsights } from "./useListInsights";

const mockListItems = [
  { id: 1, tmdbId: 100, mediaType: "movie", listId: 1, addedAt: "2024-06-15T00:00:00Z" },
  { id: 2, tmdbId: 200, mediaType: "tv", listId: 1, addedAt: "2024-07-20T00:00:00Z" },
];

const mockList = {
  id: 1,
  name: "My Favorites",
  description: "Best stuff",
  isPublic: false,
  items: mockListItems,
};

const mockMediaEntries = [
  { id: 1, tmdbId: 100, mediaType: "movie", status: "Watched", ratingStory: 8 },
];

const mockInsights = {
  totalCount: 2,
  genreDistribution: [{ name: "Action", value: 2, percentage: 100 }],
  topGenres: [{ name: "Action", value: 2, percentage: 100 }],
  topActors: [],
  topDirectors: [],
  ratingComparison: { userAverage: 8, tmdbAverage: 7, difference: 1, itemCount: 1 },
  mostActiveMonth: { monthKey: "2024-06", year: 2024, count: 1, displayName: "June 2024" },
  releaseYearBreakdown: [],
  topThree: [],
};

describe("useListInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: aggregators return mock insights
    vi.mocked(computeGenreDistribution).mockReturnValue(mockInsights.genreDistribution);
    vi.mocked(getTopGenres).mockReturnValue(mockInsights.topGenres);
    vi.mocked(computeTopActors).mockReturnValue(mockInsights.topActors);
    vi.mocked(computeTopDirectors).mockReturnValue(mockInsights.topDirectors);
    vi.mocked(computeRatingComparison).mockReturnValue(mockInsights.ratingComparison);
    vi.mocked(computeMostActiveMonth).mockReturnValue(mockInsights.mostActiveMonth);
    vi.mocked(computeReleaseYearBreakdown).mockReturnValue(mockInsights.releaseYearBreakdown);
    vi.mocked(computeTopRatedTitles).mockReturnValue(mockInsights.topThree);
  });

  it("disabled when list has no items", () => {
    vi.mocked(useListById).mockReturnValue({
      data: { ...mockList, items: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useListById>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    const { result } = renderHook(() => useListInsights(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
  });

  it("disabled when list is still loading", () => {
    vi.mocked(useListById).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useListById>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    const { result } = renderHook(() => useListInsights(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("enriches items and computes insights", async () => {
    vi.mocked(useListById).mockReturnValue({
      data: mockList,
      isLoading: false,
    } as unknown as ReturnType<typeof useListById>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: mockMediaEntries,
    } as unknown as ReturnType<typeof useMediaEntries>);

    const mockDetails = { id: 100, title: "Movie", genres: [{ id: 28, name: "Action" }] };
    const mockCredits = { cast: [{ id: 1, name: "Actor" }], crew: [] };

    vi.mocked(getMediaDetails).mockResolvedValue(mockDetails as never);
    vi.mocked(getMediaCredits).mockResolvedValue(mockCredits);

    const { result } = renderHook(() => useListInsights(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data?.totalCount).toBe(2);
    expect(result.current.listName).toBe("My Favorites");
    expect(result.current.listDescription).toBe("Best stuff");

    // Verify aggregators were called with enriched items
    expect(computeGenreDistribution).toHaveBeenCalled();
    expect(computeTopActors).toHaveBeenCalled();
    expect(computeRatingComparison).toHaveBeenCalled();
  });

  it("handles partial enrichment failure gracefully", async () => {
    vi.mocked(useListById).mockReturnValue({
      data: mockList,
      isLoading: false,
    } as unknown as ReturnType<typeof useListById>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    // First item succeeds, second fails both
    vi.mocked(getMediaDetails)
      .mockResolvedValueOnce({ id: 100, title: "Movie" } as never)
      .mockRejectedValueOnce(new Error("Not found"));
    vi.mocked(getMediaCredits)
      .mockResolvedValueOnce({ cast: [], crew: [] })
      .mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useListInsights(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    // Should still succeed with 1 enriched item (item 2 filtered out)
    expect(computeGenreDistribution).toHaveBeenCalled();
  });

  it("returns error state", () => {
    vi.mocked(useListById).mockReturnValue({
      data: mockList,
      isLoading: false,
    } as unknown as ReturnType<typeof useListById>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    const { result } = renderHook(() => useListInsights(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isError).toBeDefined();
  });
});
