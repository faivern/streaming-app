import { describe, it, expect } from "vitest";
import { keywordsFormat } from "./keywordsFormat";

describe("keywordsFormat", () => {
  it("joins keywords with commas", () => {
    expect(keywordsFormat(["action", "drama", "thriller"])).toBe("action, drama, thriller");
  });

  it("returns fallback for empty array", () => {
    expect(keywordsFormat([])).toBe("No keywords available");
  });

  it("handles a single keyword", () => {
    expect(keywordsFormat(["comedy"])).toBe("comedy");
  });

  it("trims whitespace from keywords", () => {
    expect(keywordsFormat(["  action ", " drama"])).toBe("action, drama");
  });

  it("filters out empty strings after trimming", () => {
    expect(keywordsFormat(["action", "  ", "", "drama"])).toBe("action, drama");
  });
});
