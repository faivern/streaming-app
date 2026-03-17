import { describe, it, expect } from "vitest";
import { formatCount, formatPercentage, formatRating, formatDecade } from "./formatters";

describe("formatCount", () => {
  it("formats number with thousands separator", () => {
    expect(formatCount(1234)).toBe("1,234");
  });

  it("formats zero", () => {
    expect(formatCount(0)).toBe("0");
  });

  it("formats large numbers", () => {
    expect(formatCount(1_000_000)).toBe("1,000,000");
  });
});

describe("formatPercentage", () => {
  it("rounds to zero decimals by default", () => {
    expect(formatPercentage(45.6)).toBe("46%");
  });

  it("formats with specified decimal places", () => {
    expect(formatPercentage(45.6, 1)).toBe("45.6%");
  });

  it("formats whole number", () => {
    expect(formatPercentage(100, 0)).toBe("100%");
  });
});

describe("formatRating", () => {
  it("formats to one decimal place", () => {
    expect(formatRating(7.345)).toBe("7.3");
  });

  it("adds trailing zero for whole numbers", () => {
    expect(formatRating(10)).toBe("10.0");
  });
});

describe("formatDecade", () => {
  it("returns decade string for 2023", () => {
    expect(formatDecade(2023)).toBe("2020s");
  });

  it("returns decade string for 1999", () => {
    expect(formatDecade(1999)).toBe("1990s");
  });
});
