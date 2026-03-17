import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDelayHover } from "./useDelayHover";

describe("useDelayHover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initially hovered is false", () => {
    const { result } = renderHook(() => useDelayHover());
    expect(result.current.hovered).toBe(false);
  });

  it("onEnter sets hovered to true after default enterDelay (400ms)", () => {
    const { result } = renderHook(() => useDelayHover());

    act(() => {
      result.current.onEnter();
    });

    expect(result.current.hovered).toBe(false);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.hovered).toBe(true);
  });

  it("onLeave sets hovered to false after default leaveDelay (0ms)", () => {
    const { result } = renderHook(() => useDelayHover());

    act(() => {
      result.current.onEnter();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.hovered).toBe(true);

    act(() => {
      result.current.onLeave();
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.hovered).toBe(false);
  });

  it("rapid enter/leave cancels enter timer so hovered stays false", () => {
    const { result } = renderHook(() => useDelayHover());

    act(() => {
      result.current.onEnter();
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      result.current.onLeave();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.hovered).toBe(false);
  });

  it("custom delays work", () => {
    const { result } = renderHook(() => useDelayHover(200, 100));

    act(() => {
      result.current.onEnter();
    });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current.hovered).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.hovered).toBe(true);

    act(() => {
      result.current.onLeave();
    });
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(result.current.hovered).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.hovered).toBe(false);
  });

  it("cleanup on unmount clears timers without errors", () => {
    const { result, unmount } = renderHook(() => useDelayHover());

    act(() => {
      result.current.onEnter();
    });

    expect(() => unmount()).not.toThrow();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    // No errors thrown after unmount
  });
});
