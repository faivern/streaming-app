import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/genres.api", () => ({
  getMovieGenres: vi.fn(),
  getTvGenres: vi.fn(),
}));

import { getMovieGenres, getTvGenres } from "../../api/genres.api";
import { useGenreById } from "./useGenreById";

describe("useGenreById", () => {
  it("finds genre and determines media type support", async () => {
    vi.mocked(getMovieGenres).mockResolvedValue([{ id: 28, name: "Action" }]);
    vi.mocked(getTvGenres).mockResolvedValue([{ id: 28, name: "Action" }]);
    const { result } = renderHook(() => useGenreById(28), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.genre?.name).toBe("Action");
    expect(result.current.supportsBoth).toBe(true);
    expect(result.current.defaultMediaType).toBe("movie");
  });

  it("returns undefined genre for unknown id", async () => {
    vi.mocked(getMovieGenres).mockResolvedValue([{ id: 28, name: "Action" }]);
    vi.mocked(getTvGenres).mockResolvedValue([]);
    const { result } = renderHook(() => useGenreById(99999), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.genre).toBeUndefined();
  });
});
