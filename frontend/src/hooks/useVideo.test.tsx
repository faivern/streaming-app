import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/http/axios", () => ({
  api: { defaults: { baseURL: "http://test" } },
}));

import { useVideo } from "./useVideo";

describe("useVideo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("returns null videoUrl initially", () => {
    const { result } = renderHook(() => useVideo("movie", 1, false));
    expect(result.current.videoUrl).toBeNull();
  });

  it("fetches trailer when enabled", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      json: () => Promise.resolve({ url: "https://youtube.com/watch?v=abc" }),
    } as Response);

    renderHook(() => useVideo("movie", 123, true));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://test/api/Movies/movie/123/trailer"
      );
    });
  });

  it("sets videoUrl from response", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      json: () => Promise.resolve({ url: "https://youtube.com/watch?v=abc" }),
    } as Response);

    const { result } = renderHook(() => useVideo("movie", 123, true));

    await waitFor(() => {
      expect(result.current.videoUrl).toBe("https://youtube.com/watch?v=abc");
    });
  });

  it("does not fetch when shouldFetch is false", () => {
    renderHook(() => useVideo("movie", 123, false));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("does not fetch when id is undefined", () => {
    renderHook(() => useVideo("movie", undefined, true));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
