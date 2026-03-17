import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import toast from "react-hot-toast";
import useShare from "./useShare";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

describe("useShare", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
  });

  it("copies current URL to clipboard", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://cinelas.com/movie/123" },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useShare());

    act(() => {
      result.current();
    });

    expect(mockWriteText).toHaveBeenCalledWith(
      "https://cinelas.com/movie/123",
    );
  });

  it("shows success toast after copying", async () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://cinelas.com/movie/456" },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useShare());

    await act(async () => {
      result.current();
    });

    expect(toast.success).toHaveBeenCalledWith("Link copied!");
  });

  it("uses window.location.href", () => {
    const testUrl = "https://cinelas.com/tv/789";
    Object.defineProperty(window, "location", {
      value: { href: testUrl },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useShare());

    act(() => {
      result.current();
    });

    expect(mockWriteText).toHaveBeenCalledWith(testUrl);
  });
});
