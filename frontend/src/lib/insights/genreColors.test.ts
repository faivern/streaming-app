import { describe, it, expect } from "vitest";
import { GENRE_COLORS, getGenreColor } from "./genreColors";

describe("getGenreColor", () => {
  it("returns correct color for a known genre", () => {
    expect(getGenreColor("Action")).toBe("#FF5722");
    expect(getGenreColor("Comedy")).toBe("#FFC107");
  });

  it("returns first fallback color for unknown genre", () => {
    expect(getGenreColor("UnknownGenre")).toBe("#26C6DA");
  });

  it("returns fallback at specified index", () => {
    expect(getGenreColor("UnknownGenre", 1)).toBe("#AB47BC");
    expect(getGenreColor("UnknownGenre", 3)).toBe("#FFA726");
  });

  it("wraps fallback index around array length", () => {
    // FALLBACK_COLORS has 8 entries, so index 8 wraps to 0
    expect(getGenreColor("UnknownGenre", 8)).toBe("#26C6DA");
    expect(getGenreColor("UnknownGenre", 9)).toBe("#AB47BC");
  });
});

describe("GENRE_COLORS", () => {
  it("contains expected genre keys", () => {
    const expectedKeys = [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Documentary",
      "Drama",
      "Family",
      "Fantasy",
      "History",
      "Horror",
      "Music",
      "Mystery",
      "Romance",
      "Science Fiction",
      "Thriller",
      "War",
      "Western",
    ];

    for (const key of expectedKeys) {
      expect(GENRE_COLORS).toHaveProperty(key);
    }
  });
});
