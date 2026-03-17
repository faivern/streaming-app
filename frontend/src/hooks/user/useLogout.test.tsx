import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/user.api", () => ({
  postLogoutUser: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

import { postLogoutUser } from "../../api/user.api";
import { toast } from "react-hot-toast";
import { useLogout } from "./useLogout";

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls postLogoutUser on mutate", async () => {
    vi.mocked(postLogoutUser).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(postLogoutUser).toHaveBeenCalledOnce();
    });
  });

  it("shows success toast and navigates on success", async () => {
    vi.mocked(postLogoutUser).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Logged out successfully");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows error toast on failure", async () => {
    vi.mocked(postLogoutUser).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to logout");
    });
  });
});
