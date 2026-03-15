import { describe, it, expect } from "vitest";
import languageMap from "./languageMap";

describe("languageMap", () => {
  it("maps 'en' to 'English'", () => {
    expect(languageMap["en"]).toBe("English");
  });

  it("maps 'ja' to 'Japanese'", () => {
    expect(languageMap["ja"]).toBe("Japanese");
  });

  it("returns undefined for an unknown language code", () => {
    expect(languageMap["zzz"]).toBeUndefined();
  });

  it("has the expected number of entries", () => {
    expect(Object.keys(languageMap)).toHaveLength(112);
  });
});
