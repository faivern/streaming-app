import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/keywords.api", () => ({ getKeywords: vi.fn() }));
import { getKeywords } from "../../api/keywords.api";
import { useMediaKeywords } from "./useMediaKeywords";

const mockKeywords = [
  { id: 1, name: "action" },
  { id: 2, name: "thriller" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useMediaKeywords", () => {
  it("fetches keywords successfully", async () => {
    vi.mocked(getKeywords).mockResolvedValue(mockKeywords);
    const { result } = renderHook(() => useMediaKeywords("movie", 550), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockKeywords);
    expect(getKeywords).toHaveBeenCalledWith("movie", 550);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(() => useMediaKeywords(undefined, undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
