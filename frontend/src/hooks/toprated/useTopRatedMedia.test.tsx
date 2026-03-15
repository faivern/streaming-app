import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/toprated.api", () => ({
  getTopRatedMedia: vi.fn(),
}));

import { getTopRatedMedia } from "../../api/toprated.api";
import { useTopRatedMedia } from "./useTopRatedMedia";

describe("useTopRatedMedia", () => {
  it("fetches top rated movies by default", async () => {
    vi.mocked(getTopRatedMedia).mockResolvedValue([{ id: 1, title: "Top Movie" }]);
    const { result } = renderHook(() => useTopRatedMedia(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("fetches top rated TV shows", async () => {
    vi.mocked(getTopRatedMedia).mockResolvedValue([{ id: 2, name: "Top TV" }]);
    const { result } = renderHook(() => useTopRatedMedia("tv"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTopRatedMedia).toHaveBeenCalledWith("tv");
  });
});
