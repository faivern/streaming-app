import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/similarMedia.api", () => ({ getSimilarMedia: vi.fn() }));
vi.mock("../../api/media.api", () => ({ getMediaDetails: vi.fn() }));
import { getSimilarMedia } from "../../api/similarMedia.api";
import { useSimilarMedia } from "./useSimilarMedia";

const mockSimilar = [
  { id: 1, title: "Similar Movie", media_type: "movie" as const, runtime: 120 },
  { id: 2, title: "Another Movie", media_type: "movie" as const, runtime: 95 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSimilarMedia", () => {
  it("fetches similar media", async () => {
    vi.mocked(getSimilarMedia).mockResolvedValue(mockSimilar);
    const { result } = renderHook(() => useSimilarMedia("movie", 550), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSimilar);
    expect(getSimilarMedia).toHaveBeenCalledWith("movie", 550);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(
      () => useSimilarMedia(undefined as never, undefined as never),
      { wrapper: createWrapper() }
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
