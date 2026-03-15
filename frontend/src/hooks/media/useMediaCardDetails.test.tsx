import { describe, it, expect, vi } from "vitest";
import { getRuntimeMinutes } from "./useMediaCardDetails";
import type { DetailMedia } from "../../types/tmdb";

vi.mock("../../api/media.api", () => ({ getMediaDetails: vi.fn() }));

describe("getRuntimeMinutes", () => {
  it("returns runtime for movie", () => {
    const movie = {
      id: 1,
      media_type: "movie",
      runtime: 139,
    } as DetailMedia;
    expect(getRuntimeMinutes(movie)).toBe(139);
  });

  it("returns episode_run_time[0] for tv", () => {
    const tv = {
      id: 2,
      media_type: "tv",
      episode_run_time: [45, 50],
    } as DetailMedia;
    expect(getRuntimeMinutes(tv)).toBe(45);
  });

  it("returns undefined for no data", () => {
    expect(getRuntimeMinutes(undefined)).toBeUndefined();
  });
});
