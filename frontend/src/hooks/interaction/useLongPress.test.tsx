import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useLongPress from "./useLongPress";
import type React from "react";

const createPointerEvent = (x: number, y: number) =>
  ({
    clientX: x,
    clientY: y,
  }) as unknown as React.PointerEvent;

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onLongPress after default threshold (500ms)", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire if pointer is released before threshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.onPointerUp();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("cancels if pointer moves beyond moveThreshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, moveThreshold: 10 }),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      // Move 15px diagonally (> 10px threshold)
      result.current.onPointerMove(createPointerEvent(111, 111));
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("onPointerLeave cancels the timer", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      result.current.onPointerLeave();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("onContextMenu prevents default after long press fires", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);

    const preventDefault = vi.fn();
    const contextMenuEvent = {
      preventDefault,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onContextMenu(contextMenuEvent);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
