import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../lists/useLists", () => ({
  useUserLists: vi.fn(),
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

import { useUserLists } from "../lists/useLists";
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
import { useMasterInsights } from "./useMasterInsights";

const makeListItem = (tmdbId: number, mediaType: string) => ({
  id: tmdbId,
  tmdbId,
  mediaType,
  listId: 1,
  addedAt: "2024-06-15T00:00:00Z",
});

const mockLists = [
  {
    id: 1,
    name: "Favorites",
    items: [
      makeListItem(100, "movie"),
      makeListItem(200, "tv"),
    ],
  },
  {
    id: 2,
    name: "Watch Later",
    items: [
      makeListItem(100, "movie"), // Duplicate of list 1
      makeListItem(300, "movie"),
    ],
  },
];

describe("useMasterInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(computeGenreDistribution).mockReturnValue([]);
    vi.mocked(getTopGenres).mockReturnValue([]);
    vi.mocked(computeTopActors).mockReturnValue([]);
    vi.mocked(computeTopDirectors).mockReturnValue([]);
    vi.mocked(computeRatingComparison).mockReturnValue({
      userAverage: 0, tmdbAverage: 0, difference: 0, itemCount: 0,
    });
    vi.mocked(computeMostActiveMonth).mockReturnValue(null);
    vi.mocked(computeReleaseYearBreakdown).mockReturnValue([]);
    vi.mocked(computeTopRatedTitles).mockReturnValue([]);
  });

  it("disabled when no lists exist", () => {
    vi.mocked(useUserLists).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useUserLists>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    const { result } = renderHook(() => useMasterInsights(), {
      wrapper: createWrapper(),
    });

    // No items = query disabled
    expect(result.current.data).toBeUndefined();
    expect(result.current.totalListCount).toBe(0);
  });

  it("deduplicates items across lists", async () => {
    vi.mocked(useUserLists).mockReturnValue({
      data: mockLists,
      isLoading: false,
    } as unknown as ReturnType<typeof useUserLists>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    vi.mocked(getMediaDetails).mockResolvedValue({ id: 1, title: "Movie" } as never);
    vi.mocked(getMediaCredits).mockResolvedValue({ cast: [], crew: [] });

    const { result } = renderHook(() => useMasterInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    // 4 total items across lists, but tmdbId 100/movie appears twice → 3 unique
    expect(result.current.data?.totalCount).toBe(3);
    expect(result.current.totalListCount).toBe(2);
  });

  it("enriches items and calls aggregators", async () => {
    vi.mocked(useUserLists).mockReturnValue({
      data: [mockLists[0]], // Single list with 2 items
      isLoading: false,
    } as unknown as ReturnType<typeof useUserLists>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    vi.mocked(getMediaDetails).mockResolvedValue({ id: 1, title: "Movie" } as never);
    vi.mocked(getMediaCredits).mockResolvedValue({ cast: [], crew: [] });

    const { result } = renderHook(() => useMasterInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(computeGenreDistribution).toHaveBeenCalled();
    expect(computeTopActors).toHaveBeenCalled();
    expect(computeTopDirectors).toHaveBeenCalled();
    expect(computeRatingComparison).toHaveBeenCalled();
    expect(computeMostActiveMonth).toHaveBeenCalled();
    expect(computeReleaseYearBreakdown).toHaveBeenCalled();
    expect(computeTopRatedTitles).toHaveBeenCalled();
  });

  it("shows loading when lists are loading", () => {
    vi.mocked(useUserLists).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useUserLists>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    const { result } = renderHook(() => useMasterInsights(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles all enrichment failures", async () => {
    vi.mocked(useUserLists).mockReturnValue({
      data: [mockLists[0]],
      isLoading: false,
    } as unknown as ReturnType<typeof useUserLists>);
    vi.mocked(useMediaEntries).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useMediaEntries>);

    // Both details and credits fail for all items
    vi.mocked(getMediaDetails).mockRejectedValue(new Error("API down"));
    vi.mocked(getMediaCredits).mockRejectedValue(new Error("API down"));

    const { result } = renderHook(() => useMasterInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Failed to enrich any list items");
  });
});
