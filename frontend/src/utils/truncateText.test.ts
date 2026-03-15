import { describe, it, expect } from "vitest";
import { truncateText } from "./truncateText";

describe("truncateText", () => {
  it("returns short text unchanged", () => {
    expect(truncateText("Hello")).toBe("Hello");
  });

  it("returns text of exactly 38 characters unchanged", () => {
    const text = "a".repeat(38);
    expect(truncateText(text)).toBe(text);
  });

  it("truncates text over 38 characters", () => {
    const text = "a".repeat(50);
    expect(truncateText(text)).toBe("a".repeat(35) + "...");
  });

  it("returns empty string for undefined", () => {
    expect(truncateText(undefined)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(truncateText("")).toBe("");
  });
});
