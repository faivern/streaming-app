import { describe, it, expect } from "vitest";
import { LIST_LIMITS } from "./constants";

describe("LIST_LIMITS", () => {
  it("MAX_LISTS_PER_USER is 20", () => {
    expect(LIST_LIMITS.MAX_LISTS_PER_USER).toBe(20);
  });

  it("MAX_ITEMS_PER_LIST is 10000", () => {
    expect(LIST_LIMITS.MAX_ITEMS_PER_LIST).toBe(10_000);
  });
});
