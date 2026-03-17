import { describe, it, expect } from "vitest";
import { dateFormat } from "./dateFormat";

describe("dateFormat", () => {
  it("formats a valid ISO date string", () => {
    expect(dateFormat("2023-07-04")).toBe("Jul 4, 2023");
  });

  it("returns 'No date' for undefined", () => {
    expect(dateFormat(undefined)).toBe("No date");
  });

  it("returns 'No date' for empty string", () => {
    expect(dateFormat("")).toBe("No date");
  });

  it("formats another date correctly", () => {
    expect(dateFormat("2000-12-25")).toBe("Dec 25, 2000");
  });
});
