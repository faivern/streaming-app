import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/upcoming.api", () => ({
  getUpcomingMedia: vi.fn(),
}));

import { getUpcomingMedia } from "../../api/upcoming.api";
import { useUpcomingMedia } from "./useUpcomingMedia";

describe("useUpcomingMedia", () => {
  it("fetches upcoming movies by default", async () => {
    vi.mocked(getUpcomingMedia).mockResolvedValue([{ id: 1, title: "Upcoming Movie" }]);
    const { result } = renderHook(() => useUpcomingMedia(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("fetches upcoming TV shows", async () => {
    vi.mocked(getUpcomingMedia).mockResolvedValue([{ id: 2, name: "Upcoming TV" }]);
    const { result } = renderHook(() => useUpcomingMedia("tv"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getUpcomingMedia).toHaveBeenCalledWith("tv");
  });
});
