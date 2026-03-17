import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/collections.api", () => ({
  searchCollections: vi.fn(),
  getCollectionById: vi.fn(),
}));

import { searchCollections, getCollectionById } from "../../api/collections.api";
import { useSearchCollections, useCollectionById, useFeaturedCollections } from "./useCollections";

describe("useSearchCollections", () => {
  it("fetches collections by query", async () => {
    const mockData = { page: 1, total_pages: 1, total_results: 1, results: [{ id: 1, name: "Star Wars", overview: "", poster_path: null, backdrop_path: null, parts: [] }] };
    vi.mocked(searchCollections).mockResolvedValue(mockData);
    const { result } = renderHook(() => useSearchCollections("Star Wars"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results[0].name).toBe("Star Wars");
  });

  it("disabled when query is empty", () => {
    const { result } = renderHook(() => useSearchCollections(""), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCollectionById", () => {
  it("fetches collection by id", async () => {
    const mockCollection = { id: 10, name: "Test", overview: "", poster_path: null, backdrop_path: null, parts: [] };
    vi.mocked(getCollectionById).mockResolvedValue(mockCollection);
    const { result } = renderHook(() => useCollectionById(10), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Test");
  });
});

describe("useFeaturedCollections", () => {
  it("fetches and picks first result per name", async () => {
    vi.mocked(searchCollections).mockResolvedValue({
      page: 1, total_pages: 1, total_results: 1,
      results: [{ id: 1, name: "SW", overview: "", poster_path: null, backdrop_path: null, parts: [] }],
    });
    const { result } = renderHook(() => useFeaturedCollections(["Star Wars"]), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
