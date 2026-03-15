import { describe, it, expect } from "vitest";
import { dateFormatYear } from "./dateFormatYear";

describe("dateFormatYear", () => {
  it("extracts year from a valid date string", () => {
    expect(dateFormatYear("2023-07-04")).toBe(2023);
  });

  it("returns null for null input", () => {
    expect(dateFormatYear(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(dateFormatYear(undefined)).toBeNull();
  });

  it("returns null for an invalid string", () => {
    expect(dateFormatYear("abcd-ef-gh")).toBeNull();
  });

  it("parses a short numeric string as a number", () => {
    expect(dateFormatYear("20")).toBe(20);
  });
});
