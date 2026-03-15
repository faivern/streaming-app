import { describe, it, expect } from "vitest";
import { sumDiscoverMedia } from "./sumDiscoverMedia";

describe("sumDiscoverMedia", () => {
  it("sums total_results from multiple responses", () => {
    expect(sumDiscoverMedia({ total_results: 10 }, { total_results: 20 })).toBe(30);
  });

  it("handles a single response", () => {
    expect(sumDiscoverMedia({ total_results: 42 })).toBe(42);
  });

  it("returns 0 when called with no arguments", () => {
    expect(sumDiscoverMedia()).toBe(0);
  });

  it("treats null responses as 0", () => {
    expect(sumDiscoverMedia({ total_results: 5 }, null)).toBe(5);
  });

  it("treats undefined responses as 0", () => {
    expect(sumDiscoverMedia(undefined, { total_results: 7 }, undefined)).toBe(7);
  });
});
