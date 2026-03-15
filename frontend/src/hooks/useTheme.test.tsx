import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme, THEME_OPTIONS } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('default theme is "frost" when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("frost");
  });

  it("setTheme updates theme and persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("netflix");
    });

    expect(result.current.theme).toBe("netflix");
    expect(localStorage.getItem("cinelas-theme")).toBe("netflix");
  });

  it("reads stored theme from localStorage on init", () => {
    localStorage.setItem("cinelas-theme", "blizzard");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("blizzard");
  });

  it("invalid stored value falls back to default", () => {
    localStorage.setItem("cinelas-theme", "invalid-theme");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("frost");
  });

  it("returns THEME_OPTIONS array with 3 entries", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.options).toBe(THEME_OPTIONS);
    expect(result.current.options).toHaveLength(3);
    expect(result.current.options.map((o) => o.value)).toEqual([
      "blizzard",
      "netflix",
      "frost",
    ]);
  });
});
