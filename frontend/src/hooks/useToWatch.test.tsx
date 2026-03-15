import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useToWatch from "./useToWatch";

describe("useToWatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("isPlaying starts as false", () => {
    const { result } = renderHook(() => useToWatch());
    expect(result.current.isPlaying).toBe(false);
  });

  it("handleWatchNow calls window.scrollTo", () => {
    const { result } = renderHook(() => useToWatch());

    act(() => {
      result.current.handleWatchNow();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("handleWatchNow sets isPlaying to true after 800ms delay", () => {
    const { result } = renderHook(() => useToWatch());

    act(() => {
      result.current.handleWatchNow();
    });

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("setIsPlaying can manually toggle isPlaying", () => {
    const { result } = renderHook(() => useToWatch());

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.setIsPlaying(true);
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.setIsPlaying(false);
    });
    expect(result.current.isPlaying).toBe(false);
  });
});
