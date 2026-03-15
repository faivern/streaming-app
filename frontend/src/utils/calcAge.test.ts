import { describe, it, expect, vi, afterEach } from "vitest";
import { calcAge } from "./calcAge";

describe("calcAge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates age for a living person", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15"));
    expect(calcAge("1990-01-01")).toBe("35");
  });

  it("calculates age for a deceased person", () => {
    expect(calcAge("1950-03-10", "2020-07-20")).toBe("70");
  });

  it("returns 'N/A' when no birthday is provided", () => {
    expect(calcAge()).toBe("N/A");
    expect(calcAge(undefined)).toBe("N/A");
  });

  it("returns 'N/A' for an invalid birthday", () => {
    expect(calcAge("not-a-date")).toBe("N/A");
  });

  it("returns 'N/A' for an invalid deathday", () => {
    expect(calcAge("1990-01-01", "not-a-date")).toBe("N/A");
  });

  it("handles pre-birthday edge case (has not had birthday yet this year)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-01"));
    expect(calcAge("1990-06-15")).toBe("34");
  });

  it("handles post-birthday edge case (already had birthday this year)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-01"));
    expect(calcAge("1990-06-15")).toBe("35");
  });
});
