import { describe, it, expect } from "vitest";
import { dateFormatLong } from "./dateFormatLong";

describe("dateFormatLong", () => {
  it("formats a valid ISO date with long month", () => {
    expect(dateFormatLong("2023-07-04")).toBe("July 4, 2023");
  });

  it("returns 'No date' for undefined", () => {
    expect(dateFormatLong(undefined)).toBe("No date");
  });

  it("returns 'No date' for empty string", () => {
    expect(dateFormatLong("")).toBe("No date");
  });

  it("formats another date correctly", () => {
    expect(dateFormatLong("2000-12-25")).toBe("December 25, 2000");
  });
});
