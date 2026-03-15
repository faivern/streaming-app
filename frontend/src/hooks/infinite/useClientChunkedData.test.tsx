import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClientChunkedData } from "./useClientChunkedData";

describe("useClientChunkedData", () => {
  const items = Array.from({ length: 50 }, (_, i) => i + 1);

  it("returns initial chunk of items", () => {
    const { result } = renderHook(() => useClientChunkedData(items));
    expect(result.current.visibleItems).toHaveLength(20);
    expect(result.current.visibleItems).toEqual(items.slice(0, 20));
    expect(result.current.hasMore).toBe(true);
  });

  it("loadMore increases visible items", () => {
    const { result } = renderHook(() => useClientChunkedData(items));

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleItems).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);
  });

  it("hasMore is false when all items visible", () => {
    const { result } = renderHook(() => useClientChunkedData(items));

    act(() => {
      result.current.loadMore();
    });
    act(() => {
      result.current.loadMore();
    });

    expect(result.current.visibleItems).toHaveLength(50);
    expect(result.current.hasMore).toBe(false);
  });

  it("reset returns to initial chunk size", () => {
    const { result } = renderHook(() => useClientChunkedData(items));

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.visibleItems).toHaveLength(40);

    act(() => {
      result.current.reset();
    });
    expect(result.current.visibleItems).toHaveLength(20);
  });

  it("custom chunkSize works", () => {
    const { result } = renderHook(() => useClientChunkedData(items, 10));
    expect(result.current.visibleItems).toHaveLength(10);

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.visibleItems).toHaveLength(20);
  });
});
