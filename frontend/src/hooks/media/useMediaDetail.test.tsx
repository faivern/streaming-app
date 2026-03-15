import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/media.api", () => ({ getMediaDetails: vi.fn() }));
import { getMediaDetails } from "../../api/media.api";
import { useMediaDetail } from "./useMediaDetail";

const mockDetail = {
  id: 550,
  title: "Fight Club",
  media_type: "movie" as const,
  runtime: 139,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useMediaDetail", () => {
  it("fetches media details successfully", async () => {
    vi.mocked(getMediaDetails).mockResolvedValue(mockDetail);
    const { result } = renderHook(() => useMediaDetail("movie", 550), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDetail);
    expect(getMediaDetails).toHaveBeenCalledWith("movie", 550, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("disabled when mediaType undefined", () => {
    const { result } = renderHook(() => useMediaDetail(undefined, 550), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("disabled when id undefined", () => {
    const { result } = renderHook(() => useMediaDetail("movie", undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
