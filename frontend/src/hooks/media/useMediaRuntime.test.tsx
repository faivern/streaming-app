import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useMediaRuntime from "./useMediaRuntime";

describe("useMediaRuntime", () => {
  it("formats movie runtime with hours and minutes", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "movie", runtimeMin: 150 })
    );
    expect(result.current).toBe("2h 30min");
  });

  it("formats movie runtime with hours only", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "movie", runtimeMin: 120 })
    );
    expect(result.current).toBe("2h");
  });

  it("formats movie runtime with minutes only", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "movie", runtimeMin: 45 })
    );
    expect(result.current).toBe("45min");
  });

  it("returns null for movie with null runtime", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "movie", runtimeMin: null })
    );
    expect(result.current).toBeNull();
  });

  it("returns null for movie with zero runtime", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "movie", runtimeMin: 0 })
    );
    expect(result.current).toBeNull();
  });

  it("formats TV show with seasons and episodes", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "tv", seasons: 3, episodes: 24 })
    );
    expect(result.current).toBe("3 Seasons \u2022 24 Episodes");
  });

  it("uses singular for 1 season", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "tv", seasons: 1, episodes: 10 })
    );
    expect(result.current).toBe("1 Season \u2022 10 Episodes");
  });

  it("shows episodes only when no seasons", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "tv", episodes: 12 })
    );
    expect(result.current).toBe("12 Episodes");
  });

  it("shows seasons only when no episodes", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "tv", seasons: 5 })
    );
    expect(result.current).toBe("5 Seasons");
  });

  it("returns null for unknown mediaType", () => {
    const { result } = renderHook(() =>
      useMediaRuntime({ mediaType: "podcast", runtimeMin: 60 })
    );
    expect(result.current).toBeNull();
  });
});
