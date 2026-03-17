import { describe, it, expect } from "vitest";
import genreMap from "./genreMap";

describe("genreMap", () => {
  it("maps 28 to 'Action'", () => {
    expect(genreMap[28]).toBe("Action");
  });

  it("maps 18 to 'Drama'", () => {
    expect(genreMap[18]).toBe("Drama");
  });

  it("returns undefined for an unknown genre ID", () => {
    expect(genreMap[99999]).toBeUndefined();
  });

  it("has the expected number of entries", () => {
    expect(Object.keys(genreMap)).toHaveLength(53);
  });
});
