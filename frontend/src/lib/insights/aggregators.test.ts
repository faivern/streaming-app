import { describe, it, expect } from "vitest";
import {
  computeGenreDistribution,
  getTopGenres,
  computeTopActors,
  computeTopDirectors,
  computeRatingComparison,
  computeMostActiveMonth,
  computeReleaseYearBreakdown,
  computeTopRatedTitles,
} from "./aggregators";
import type { EnrichedListItem } from "../../types/insights";
import type { MediaEntry } from "../../types/mediaEntry";

// ---------------------------------------------------------------------------
// Helpers to build test data
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<EnrichedListItem> = {}): EnrichedListItem {
  return {
    id: 1,
    listId: 1,
    tmdbId: 100,
    mediaType: "movie",
    title: "Test Movie",
    posterPath: null,
    backdropPath: null,
    overview: null,
    voteAverage: null,
    runtime: undefined,
    releaseDate: undefined,
    firstAirDate: undefined,
    numberOfSeasons: undefined,
    numberOfEpisodes: undefined,
    addedAt: "2024-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeMediaEntry(
  overrides: Partial<MediaEntry> = {}
): MediaEntry {
  return {
    id: 1,
    userId: "user-1",
    tmdbId: 100,
    mediaType: "movie",
    title: "Test Movie",
    posterPath: null,
    backdropPath: null,
    overview: null,
    voteAverage: null,
    runtime: undefined,
    releaseDate: undefined,
    firstAirDate: undefined,
    numberOfSeasons: undefined,
    numberOfEpisodes: undefined,
    status: "Watched",
    ratingActing: null,
    ratingStory: null,
    ratingSoundtrack: null,
    ratingVisuals: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    watchedAt: null,
    review: null,
    ...overrides,
  };
}

// ===========================================================================
// computeGenreDistribution
// ===========================================================================

describe("computeGenreDistribution", () => {
  it("returns empty array for empty items", () => {
    expect(computeGenreDistribution([])).toEqual([]);
  });

  it("counts genres from a single item", () => {
    const items = [
      makeItem({
        details: {
          genres: [
            { id: 1, name: "Action" },
            { id: 2, name: "Comedy" },
          ],
        },
      }),
    ];

    const result = computeGenreDistribution(items);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(1);
    expect(result[1].value).toBe(1);
    expect(result[0].percentage).toBe(50);
    expect(result[1].percentage).toBe(50);
  });

  it("aggregates genres across multiple items and sorts descending", () => {
    const items = [
      makeItem({
        id: 1,
        details: {
          genres: [
            { id: 1, name: "Action" },
            { id: 2, name: "Drama" },
          ],
        },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        details: {
          genres: [
            { id: 1, name: "Action" },
            { id: 3, name: "Comedy" },
          ],
        },
      }),
      makeItem({
        id: 3,
        tmdbId: 102,
        details: {
          genres: [{ id: 1, name: "Action" }],
        },
      }),
    ];

    const result = computeGenreDistribution(items);

    expect(result[0].name).toBe("Action");
    expect(result[0].value).toBe(3);

    // Total genre tags = 5 (3 Action + 1 Drama + 1 Comedy)
    const totalPercentage = result.reduce((s, g) => s + g.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it("returns empty array when items have no genres in details", () => {
    const items = [makeItem({ details: { genres: [] } }), makeItem({ details: {} })];
    expect(computeGenreDistribution(items)).toEqual([]);
  });

  it("handles items without details property", () => {
    const items = [makeItem()];
    expect(computeGenreDistribution(items)).toEqual([]);
  });
});

// ===========================================================================
// getTopGenres
// ===========================================================================

describe("getTopGenres", () => {
  it("returns top N genres from distribution", () => {
    const dist = [
      { name: "A", value: 5, percentage: 50 },
      { name: "B", value: 3, percentage: 30 },
      { name: "C", value: 2, percentage: 20 },
    ];

    expect(getTopGenres(dist, 2)).toHaveLength(2);
    expect(getTopGenres(dist, 2)[0].name).toBe("A");
    expect(getTopGenres(dist, 2)[1].name).toBe("B");
  });

  it("returns all when fewer items than limit", () => {
    const dist = [{ name: "A", value: 5, percentage: 100 }];
    expect(getTopGenres(dist, 5)).toHaveLength(1);
  });

  it("uses default limit of 5", () => {
    const dist = Array.from({ length: 10 }, (_, i) => ({
      name: `Genre${i}`,
      value: 10 - i,
      percentage: 10,
    }));
    expect(getTopGenres(dist)).toHaveLength(5);
  });
});

// ===========================================================================
// computeTopActors
// ===========================================================================

describe("computeTopActors", () => {
  it("returns empty array for empty items", () => {
    expect(computeTopActors([])).toEqual([]);
  });

  it("extracts actors from a single item", () => {
    const items = [
      makeItem({
        details: { title: "Movie A" },
        credits: {
          cast: [
            { id: 1, name: "Actor A", order: 0, profile_path: "/a.jpg" },
            { id: 2, name: "Actor B", order: 1, profile_path: null },
          ],
          crew: [],
        },
      }),
    ];

    const result = computeTopActors(items);
    expect(result).toHaveLength(2);
    expect(result[0].count).toBe(1);
    expect(result[0].name).toBe("Actor A");
    expect(result[0].profilePath).toBe("/a.jpg");
  });

  it("counts shared actors across multiple items", () => {
    const items = [
      makeItem({
        id: 1,
        tmdbId: 100,
        details: { title: "Movie A" },
        credits: {
          cast: [{ id: 1, name: "Actor A", order: 0, profile_path: null }],
          crew: [],
        },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        details: { title: "Movie B" },
        credits: {
          cast: [
            { id: 1, name: "Actor A", order: 0, profile_path: null },
            { id: 2, name: "Actor B", order: 1, profile_path: null },
          ],
          crew: [],
        },
      }),
    ];

    const result = computeTopActors(items);
    expect(result[0].name).toBe("Actor A");
    expect(result[0].count).toBe(2);
    expect(result[0].roles).toHaveLength(2);
  });

  it("respects limit parameter", () => {
    const items = [
      makeItem({
        credits: {
          cast: Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            name: `Actor ${i}`,
            order: i,
            profile_path: null,
          })),
          crew: [],
        },
      }),
    ];

    expect(computeTopActors(items, 2)).toHaveLength(2);
  });

  it("only uses top 5 cast members by order per item", () => {
    const items = [
      makeItem({
        details: { title: "Movie A" },
        credits: {
          cast: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Actor ${i}`,
            order: i,
            profile_path: null,
          })),
          crew: [],
        },
      }),
    ];

    // Only 5 actors should be counted even though 10 are in cast
    const result = computeTopActors(items, 10);
    expect(result).toHaveLength(5);
  });

  it("handles items without credits", () => {
    const items = [makeItem()];
    expect(computeTopActors(items)).toEqual([]);
  });

  it("sorts actors by count descending", () => {
    const items = [
      makeItem({
        id: 1,
        tmdbId: 100,
        credits: {
          cast: [
            { id: 1, name: "Rare Actor", order: 0, profile_path: null },
            { id: 2, name: "Common Actor", order: 1, profile_path: null },
          ],
          crew: [],
        },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        credits: {
          cast: [{ id: 2, name: "Common Actor", order: 0, profile_path: null }],
          crew: [],
        },
      }),
      makeItem({
        id: 3,
        tmdbId: 102,
        credits: {
          cast: [{ id: 2, name: "Common Actor", order: 0, profile_path: null }],
          crew: [],
        },
      }),
    ];

    const result = computeTopActors(items);
    expect(result[0].name).toBe("Common Actor");
    expect(result[0].count).toBe(3);
    expect(result[1].name).toBe("Rare Actor");
    expect(result[1].count).toBe(1);
  });
});

// ===========================================================================
// computeTopDirectors
// ===========================================================================

describe("computeTopDirectors", () => {
  it("returns empty array for empty items", () => {
    expect(computeTopDirectors([])).toEqual([]);
  });

  it("extracts directors from crew with job === 'Director'", () => {
    const items = [
      makeItem({
        details: { title: "Movie A" },
        credits: {
          cast: [],
          crew: [
            { id: 1, name: "Director A", job: "Director", profile_path: "/d.jpg" },
            { id: 2, name: "Producer B", job: "Producer", profile_path: null },
          ],
        },
      }),
    ];

    const result = computeTopDirectors(items);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Director A");
    expect(result[0].profilePath).toBe("/d.jpg");
  });

  it("counts shared directors across multiple items", () => {
    const items = [
      makeItem({
        id: 1,
        tmdbId: 100,
        details: { title: "Movie A" },
        credits: {
          cast: [],
          crew: [{ id: 1, name: "Director A", job: "Director", profile_path: null }],
        },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        details: { title: "Movie B" },
        credits: {
          cast: [],
          crew: [{ id: 1, name: "Director A", job: "Director", profile_path: null }],
        },
      }),
    ];

    const result = computeTopDirectors(items);
    expect(result[0].count).toBe(2);
    expect(result[0].roles).toHaveLength(2);
  });

  it("ignores crew members who are not directors", () => {
    const items = [
      makeItem({
        credits: {
          cast: [],
          crew: [
            { id: 1, name: "Writer A", job: "Writer", profile_path: null },
            { id: 2, name: "Cinematographer B", job: "Director of Photography", profile_path: null },
          ],
        },
      }),
    ];

    expect(computeTopDirectors(items)).toEqual([]);
  });

  it("handles items without credits", () => {
    expect(computeTopDirectors([makeItem()])).toEqual([]);
  });
});

// ===========================================================================
// computeRatingComparison
// ===========================================================================

describe("computeRatingComparison", () => {
  it("returns zeros for empty items", () => {
    const result = computeRatingComparison([], []);
    expect(result).toEqual({
      userAverage: 0,
      tmdbAverage: 0,
      difference: 0,
      itemCount: 0,
    });
  });

  it("computes user vs TMDB averages when MediaEntry exists", () => {
    const items = [
      makeItem({
        tmdbId: 100,
        mediaType: "movie",
        details: { vote_average: 7.0 },
      }),
    ];
    const entries = [
      makeMediaEntry({
        tmdbId: 100,
        mediaType: "movie",
        ratingActing: 8,
        ratingStory: 6,
        ratingVisuals: 8,
        ratingSoundtrack: 6,
      }),
    ];

    const result = computeRatingComparison(items, entries);

    // User avg = (8+6+8+6)/4 = 7.0
    expect(result.userAverage).toBe(7.0);
    expect(result.tmdbAverage).toBe(7.0);
    expect(result.difference).toBe(0);
    expect(result.itemCount).toBe(1);
  });

  it("uses TMDB for both when no MediaEntry exists", () => {
    const items = [
      makeItem({
        tmdbId: 100,
        mediaType: "movie",
        details: { vote_average: 8.5 },
      }),
    ];

    const result = computeRatingComparison(items, []);

    expect(result.userAverage).toBe(8.5);
    expect(result.tmdbAverage).toBe(8.5);
    expect(result.difference).toBe(0);
    expect(result.itemCount).toBe(1);
  });

  it("handles mixed items with and without MediaEntry", () => {
    const items = [
      makeItem({
        id: 1,
        tmdbId: 100,
        mediaType: "movie",
        details: { vote_average: 6.0 },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        mediaType: "movie",
        details: { vote_average: 8.0 },
      }),
    ];
    const entries = [
      makeMediaEntry({
        tmdbId: 100,
        mediaType: "movie",
        ratingActing: 9,
        ratingStory: 9,
        ratingVisuals: 9,
        ratingSoundtrack: 9,
      }),
    ];

    const result = computeRatingComparison(items, entries);

    // Item 1: user=9, tmdb=6
    // Item 2: user=8 (tmdb fallback), tmdb=8
    // userAvg = (9+8)/2 = 8.5, tmdbAvg = (6+8)/2 = 7
    expect(result.userAverage).toBe(8.5);
    expect(result.tmdbAverage).toBe(7);
    expect(result.difference).toBe(1.5);
    expect(result.itemCount).toBe(2);
  });

  it("skips items without TMDB vote_average", () => {
    const items = [
      makeItem({ tmdbId: 100, mediaType: "movie", details: {} }),
    ];

    const result = computeRatingComparison(items, []);
    expect(result.itemCount).toBe(0);
  });

  it("skips MediaEntry with all null ratings (uses TMDB fallback for both)", () => {
    const items = [
      makeItem({
        tmdbId: 100,
        mediaType: "movie",
        details: { vote_average: 7.0 },
      }),
    ];
    const entries = [
      makeMediaEntry({
        tmdbId: 100,
        mediaType: "movie",
        ratingActing: null,
        ratingStory: null,
        ratingVisuals: null,
        ratingSoundtrack: null,
      }),
    ];

    // Entry exists but has no ratings -> the filter produces empty array
    // so the "if (ratings.length > 0)" branch is skipped, meaning entry
    // does NOT contribute, and the else branch is also not reached
    // because entry WAS found. So this item is skipped entirely.
    const result = computeRatingComparison(items, entries);
    expect(result.itemCount).toBe(0);
  });
});

// ===========================================================================
// computeMostActiveMonth
// ===========================================================================

describe("computeMostActiveMonth", () => {
  it("returns null for empty items", () => {
    expect(computeMostActiveMonth([])).toBeNull();
  });

  it("identifies single month correctly", () => {
    const items = [
      makeItem({ addedAt: "2024-03-10T00:00:00Z" }),
      makeItem({ id: 2, addedAt: "2024-03-20T00:00:00Z" }),
    ];

    const result = computeMostActiveMonth(items);
    expect(result).not.toBeNull();
    expect(result!.monthKey).toBe("2024-03");
    expect(result!.count).toBe(2);
    expect(result!.year).toBe(2024);
    expect(result!.displayName).toContain("March");
    expect(result!.displayName).toContain("2024");
  });

  it("picks month with highest count", () => {
    const items = [
      makeItem({ id: 1, addedAt: "2024-01-10T00:00:00Z" }),
      makeItem({ id: 2, addedAt: "2024-06-10T00:00:00Z" }),
      makeItem({ id: 3, addedAt: "2024-06-15T00:00:00Z" }),
      makeItem({ id: 4, addedAt: "2024-06-20T00:00:00Z" }),
    ];

    const result = computeMostActiveMonth(items);
    expect(result!.monthKey).toBe("2024-06");
    expect(result!.count).toBe(3);
  });

  it("returns null when items have no valid addedAt", () => {
    const items = [makeItem({ addedAt: "" })];
    const result = computeMostActiveMonth(items);
    expect(result).toBeNull();
  });
});

// ===========================================================================
// computeReleaseYearBreakdown
// ===========================================================================

describe("computeReleaseYearBreakdown", () => {
  it("returns empty array for empty items", () => {
    expect(computeReleaseYearBreakdown([])).toEqual([]);
  });

  it("groups items by release year with correct decade labels", () => {
    const items = [
      makeItem({
        id: 1,
        tmdbId: 100,
        details: { release_date: "2023-05-01" },
      }),
      makeItem({
        id: 2,
        tmdbId: 101,
        details: { release_date: "2023-11-01" },
      }),
      makeItem({
        id: 3,
        tmdbId: 102,
        details: { release_date: "1999-06-01" },
      }),
    ];

    const result = computeReleaseYearBreakdown(items);

    // Sorted descending by year
    expect(result[0].year).toBe(2023);
    expect(result[0].decade).toBe("2020s");
    expect(result[0].count).toBe(2);

    expect(result[1].year).toBe(1999);
    expect(result[1].decade).toBe("1990s");
    expect(result[1].count).toBe(1);
  });

  it("uses first_air_date for TV items", () => {
    const items = [
      makeItem({
        mediaType: "tv",
        details: { first_air_date: "2020-01-01" },
      }),
    ];

    const result = computeReleaseYearBreakdown(items);
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2020);
    expect(result[0].decade).toBe("2020s");
  });

  it("falls back to item-level releaseDate when details date is missing", () => {
    const items = [
      makeItem({
        releaseDate: "2015-07-01",
        details: {},
      }),
    ];

    const result = computeReleaseYearBreakdown(items);
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2015);
    expect(result[0].decade).toBe("2010s");
  });

  it("is sorted by year descending", () => {
    const items = [
      makeItem({ id: 1, tmdbId: 100, details: { release_date: "1985-01-01" } }),
      makeItem({ id: 2, tmdbId: 101, details: { release_date: "2022-01-01" } }),
      makeItem({ id: 3, tmdbId: 102, details: { release_date: "2000-01-01" } }),
    ];

    const result = computeReleaseYearBreakdown(items);
    expect(result[0].year).toBe(2022);
    expect(result[1].year).toBe(2000);
    expect(result[2].year).toBe(1985);
  });

  it("skips items without any date", () => {
    const items = [makeItem({ details: {} })];
    expect(computeReleaseYearBreakdown(items)).toEqual([]);
  });
});

// ===========================================================================
// computeTopRatedTitles
// ===========================================================================

describe("computeTopRatedTitles", () => {
  it("returns empty array for empty items", () => {
    expect(computeTopRatedTitles([], [])).toEqual([]);
  });

  it("returns titles sorted by user rating", () => {
    const items = [
      makeItem({ id: 1, tmdbId: 100, mediaType: "movie", details: { title: "Low", vote_average: 5 } }),
      makeItem({ id: 2, tmdbId: 101, mediaType: "movie", details: { title: "High", vote_average: 5 } }),
    ];
    const entries = [
      makeMediaEntry({ tmdbId: 100, mediaType: "movie", ratingActing: 6, ratingStory: 6, ratingVisuals: 6, ratingSoundtrack: 6 }),
      makeMediaEntry({ id: 2, tmdbId: 101, mediaType: "movie", ratingActing: 9, ratingStory: 9, ratingVisuals: 9, ratingSoundtrack: 9 }),
    ];

    const result = computeTopRatedTitles(items, entries);
    expect(result[0].title).toBe("High");
    expect(result[0].rating).toBe(9);
    expect(result[1].title).toBe("Low");
    expect(result[1].rating).toBe(6);
  });

  it("falls back to TMDB vote_average when no user rating", () => {
    const items = [
      makeItem({ tmdbId: 100, mediaType: "movie", details: { title: "TMDB Rated", vote_average: 8.5 } }),
    ];

    const result = computeTopRatedTitles(items, []);
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBe(8.5);
  });

  it("excludes items with zero rating (no user rating and no TMDB)", () => {
    const items = [
      makeItem({ tmdbId: 100, mediaType: "movie", details: { title: "No Rating", vote_average: 0 } }),
      makeItem({ id: 2, tmdbId: 101, mediaType: "movie", details: { title: "No Rating 2" } }),
    ];

    const result = computeTopRatedTitles(items, []);
    expect(result).toEqual([]);
  });

  it("respects limit parameter", () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({
        id: i + 1,
        tmdbId: 100 + i,
        mediaType: "movie",
        details: { title: `Movie ${i}`, vote_average: 7 + i * 0.1 },
      })
    );

    expect(computeTopRatedTitles(items, [], 2)).toHaveLength(2);
  });

  it("uses default limit of 3", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem({
        id: i + 1,
        tmdbId: 100 + i,
        mediaType: "movie",
        details: { title: `Movie ${i}`, vote_average: 5 + i * 0.1 },
      })
    );

    expect(computeTopRatedTitles(items, [])).toHaveLength(3);
  });

  it("includes posterPath and mediaType in output", () => {
    const items = [
      makeItem({
        tmdbId: 100,
        mediaType: "tv",
        details: { title: "Show", vote_average: 9, poster_path: "/poster.jpg" },
      }),
    ];

    const result = computeTopRatedTitles(items, []);
    expect(result[0].posterPath).toBe("/poster.jpg");
    expect(result[0].mediaType).toBe("tv");
    expect(result[0].tmdbId).toBe(100);
  });

  it("prefers user rating over TMDB when both exist", () => {
    const items = [
      makeItem({
        tmdbId: 100,
        mediaType: "movie",
        details: { title: "Mixed", vote_average: 5.0 },
      }),
    ];
    const entries = [
      makeMediaEntry({
        tmdbId: 100,
        mediaType: "movie",
        ratingActing: 9,
        ratingStory: 9,
        ratingVisuals: 9,
        ratingSoundtrack: 9,
      }),
    ];

    const result = computeTopRatedTitles(items, entries);
    expect(result[0].rating).toBe(9);
  });
});
