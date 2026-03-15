import { describe, it, expect } from "vitest";
import type { ListItem } from "./list";
import type { MediaEntry } from "./mediaEntry";
import {
  listItemToDisplayItem,
  mediaEntryToDisplayItem,
  calculateAverageRating,
} from "./lists.view";

const makeListItem = (overrides: Partial<ListItem> = {}): ListItem => ({
  id: 1,
  listId: 10,
  tmdbId: 550,
  mediaType: "movie",
  title: "Fight Club",
  posterPath: "/poster.jpg",
  backdropPath: "/backdrop.jpg",
  overview: "An insomniac office worker...",
  voteAverage: 8.4,
  runtime: 139,
  releaseDate: "1999-10-15",
  firstAirDate: undefined,
  numberOfSeasons: undefined,
  numberOfEpisodes: undefined,
  addedAt: "2025-01-15T10:00:00Z",
  ...overrides,
});

const makeMediaEntry = (overrides: Partial<MediaEntry> = {}): MediaEntry => ({
  id: 5,
  userId: "user-123",
  tmdbId: 550,
  mediaType: "movie",
  title: "Fight Club",
  posterPath: "/poster.jpg",
  backdropPath: "/backdrop.jpg",
  overview: "An insomniac office worker...",
  voteAverage: 8.4,
  runtime: 139,
  releaseDate: "1999-10-15",
  firstAirDate: undefined,
  numberOfSeasons: undefined,
  numberOfEpisodes: undefined,
  status: "Watched",
  ratingActing: 8,
  ratingStory: 9,
  ratingSoundtrack: 7,
  ratingVisuals: 8,
  createdAt: "2025-01-10T08:00:00Z",
  updatedAt: "2025-01-12T12:00:00Z",
  watchedAt: "2025-01-11T20:00:00Z",
  review: {
    id: 1,
    mediaEntryId: 5,
    content: "Great movie",
    createdAt: "2025-01-12T12:00:00Z",
    updatedAt: "2025-01-12T12:00:00Z",
  },
  ...overrides,
});

describe("listItemToDisplayItem", () => {
  it("converts a full ListItem correctly", () => {
    const item = makeListItem();
    const result = listItemToDisplayItem(item);

    expect(result.id).toBe(1);
    expect(result.tmdbId).toBe(550);
    expect(result.mediaType).toBe("movie");
    expect(result.title).toBe("Fight Club");
    expect(result.posterPath).toBe("/poster.jpg");
    expect(result.backdropPath).toBe("/backdrop.jpg");
    expect(result.overview).toBe("An insomniac office worker...");
    expect(result.voteAverage).toBe(8.4);
    expect(result.addedAt).toBe("2025-01-15T10:00:00Z");
    expect(result.runtime).toBe(139);
    expect(result.releaseDate).toBe("1999-10-15");
    expect(result.firstAirDate).toBeUndefined();
    expect(result.numberOfSeasons).toBeUndefined();
    expect(result.numberOfEpisodes).toBeUndefined();
  });

  it("sets source to 'list' and sourceId to listId", () => {
    const item = makeListItem({ listId: 42 });
    const result = listItemToDisplayItem(item);

    expect(result.source).toBe("list");
    expect(result.sourceId).toBe(42);
  });

  it("uses 'Untitled' when title is null", () => {
    const item = makeListItem({ title: null });
    const result = listItemToDisplayItem(item);

    expect(result.title).toBe("Untitled");
  });

  it("preserves null posterPath", () => {
    const item = makeListItem({ posterPath: null });
    const result = listItemToDisplayItem(item);

    expect(result.posterPath).toBeNull();
  });
});

describe("mediaEntryToDisplayItem", () => {
  it("converts a full MediaEntry correctly", () => {
    const entry = makeMediaEntry();
    const result = mediaEntryToDisplayItem(entry);

    expect(result.id).toBe(5);
    expect(result.tmdbId).toBe(550);
    expect(result.mediaType).toBe("movie");
    expect(result.title).toBe("Fight Club");
    expect(result.posterPath).toBe("/poster.jpg");
    expect(result.backdropPath).toBe("/backdrop.jpg");
    expect(result.overview).toBe("An insomniac office worker...");
    expect(result.voteAverage).toBe(8.4);
    expect(result.status).toBe("Watched");
    expect(result.runtime).toBe(139);
    expect(result.releaseDate).toBe("1999-10-15");
    expect(result.firstAirDate).toBeUndefined();
    expect(result.numberOfSeasons).toBeUndefined();
    expect(result.numberOfEpisodes).toBeUndefined();
  });

  it("sets source to 'entry' and sourceId to entry.id", () => {
    const entry = makeMediaEntry({ id: 99 });
    const result = mediaEntryToDisplayItem(entry);

    expect(result.source).toBe("entry");
    expect(result.sourceId).toBe(99);
  });

  it("maps createdAt to addedAt", () => {
    const entry = makeMediaEntry({ createdAt: "2025-06-01T00:00:00Z" });
    const result = mediaEntryToDisplayItem(entry);

    expect(result.addedAt).toBe("2025-06-01T00:00:00Z");
  });

  it("uses 'Untitled' when title is null", () => {
    const entry = makeMediaEntry({ title: null });
    const result = mediaEntryToDisplayItem(entry);

    expect(result.title).toBe("Untitled");
  });

  it("includes ratings and review", () => {
    const entry = makeMediaEntry({
      ratingActing: 8,
      ratingStory: 9,
      ratingSoundtrack: 7,
      ratingVisuals: 8,
      review: {
        id: 1,
        mediaEntryId: 5,
        content: "Great movie",
        createdAt: "2025-01-12T12:00:00Z",
        updatedAt: "2025-01-12T12:00:00Z",
      },
    });
    const result = mediaEntryToDisplayItem(entry);

    expect(result.ratingActing).toBe(8);
    expect(result.ratingStory).toBe(9);
    expect(result.ratingSoundtrack).toBe(7);
    expect(result.ratingVisuals).toBe(8);
    expect(result.review).toEqual({ id: 1, mediaEntryId: 5, content: "Great movie", createdAt: "2025-01-12T12:00:00Z", updatedAt: "2025-01-12T12:00:00Z" });
  });
});

describe("calculateAverageRating", () => {
  it("returns average when all 4 ratings are present", () => {
    const item = listItemToDisplayItem(makeListItem());
    item.ratingActing = 8;
    item.ratingStory = 6;
    item.ratingSoundtrack = 7;
    item.ratingVisuals = 9;

    const result = calculateAverageRating(item);

    expect(result).toBe(7.5);
  });

  it("returns average of only non-null ratings", () => {
    const item = listItemToDisplayItem(makeListItem());
    item.ratingActing = 8;
    item.ratingStory = null;
    item.ratingSoundtrack = 6;
    item.ratingVisuals = null;

    const result = calculateAverageRating(item);

    expect(result).toBe(7);
  });

  it("returns null when no ratings are present", () => {
    const item = listItemToDisplayItem(makeListItem());
    item.ratingActing = null;
    item.ratingStory = null;
    item.ratingSoundtrack = null;
    item.ratingVisuals = null;

    const result = calculateAverageRating(item);

    expect(result).toBeNull();
  });
});
