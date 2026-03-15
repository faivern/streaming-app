import { describe, it, expect } from "vitest";
import { countMovies } from "./countMovies";

describe("countMovies", () => {
  it("counts parts in the array", () => {
    expect(countMovies([{ id: 1 }, { id: 2 }, { id: 3 }])).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(countMovies([])).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(countMovies(undefined)).toBe(0);
  });
});
