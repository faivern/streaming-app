import { describe, it, expect } from "vitest";
import { avgCollectionRating } from "./avgCollectionRating";

describe("avgCollectionRating", () => {
  it("calculates the average rating", () => {
    const parts = [{ vote_average: 7.0 }, { vote_average: 8.0 }, { vote_average: 9.0 }];
    expect(avgCollectionRating(parts)).toBe("8.0");
  });

  it("returns null for empty array", () => {
    expect(avgCollectionRating([])).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(avgCollectionRating(undefined)).toBeNull();
  });

  it("returns null when all ratings are zero", () => {
    const parts = [{ vote_average: 0 }, { vote_average: 0 }];
    expect(avgCollectionRating(parts)).toBeNull();
  });

  it("excludes zero ratings from the average", () => {
    const parts = [{ vote_average: 6.0 }, { vote_average: 0 }, { vote_average: 8.0 }];
    expect(avgCollectionRating(parts)).toBe("7.0");
  });

  it("handles a single part", () => {
    expect(avgCollectionRating([{ vote_average: 5.5 }])).toBe("5.5");
  });
});
