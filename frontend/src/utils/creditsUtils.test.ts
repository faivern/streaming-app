import { describe, it, expect } from "vitest";
import { getDirector, getMainCast, getCreatorsString } from "./creditsUtils";

describe("getDirector", () => {
  it("finds the director from crew", () => {
    const crew = [
      { name: "Alice", job: "Producer" },
      { name: "Bob", job: "Director" },
      { name: "Carol", job: "Writer" },
    ];
    expect(getDirector(crew)).toEqual({ name: "Bob", job: "Director" });
  });

  it("returns undefined when no director exists", () => {
    const crew = [
      { name: "Alice", job: "Producer" },
      { name: "Carol", job: "Writer" },
    ];
    expect(getDirector(crew)).toBeUndefined();
  });
});

describe("getMainCast", () => {
  const cast = [
    { name: "C", order: 2 },
    { name: "A", order: 0 },
    { name: "D", order: 3 },
    { name: "B", order: 1 },
  ];

  it("sorts by order and returns top N", () => {
    const result = getMainCast(cast, 2);
    expect(result).toEqual([
      { name: "A", order: 0 },
      { name: "B", order: 1 },
    ]);
  });

  it("respects custom count parameter", () => {
    expect(getMainCast(cast, 4)).toHaveLength(4);
  });

  it("defaults to 3 when count is not specified", () => {
    expect(getMainCast(cast)).toHaveLength(3);
    expect(getMainCast(cast)[0]).toEqual({ name: "A", order: 0 });
  });
});

describe("getCreatorsString", () => {
  it("joins creator names with commas", () => {
    const creators = [{ name: "Alice" }, { name: "Bob" }];
    expect(getCreatorsString(creators)).toBe("Alice, Bob");
  });

  it("returns empty string for empty array", () => {
    expect(getCreatorsString([])).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(getCreatorsString(undefined)).toBe("");
  });
});
