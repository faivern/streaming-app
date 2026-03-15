import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/discover.api", () => ({
  getDiscoverMovies: vi.fn(),
  getDiscoverTv: vi.fn(),
}));

import { getDiscoverMovies, getDiscoverTv } from "../../api/discover.api";
import { useDiscoverMovies, useDiscoverTv } from "./useDiscover";

describe("useDiscoverMovies", () => {
  it("fetches movie discover data", async () => {
    vi.mocked(getDiscoverMovies).mockResolvedValue({ total_results: 500 });
    const { result } = renderHook(() => useDiscoverMovies(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ total_results: 500 });
  });
});

describe("useDiscoverTv", () => {
  it("fetches tv discover data", async () => {
    vi.mocked(getDiscoverTv).mockResolvedValue({ total_results: 300 });
    const { result } = renderHook(() => useDiscoverTv(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ total_results: 300 });
  });
});
