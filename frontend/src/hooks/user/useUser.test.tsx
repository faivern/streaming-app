import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/user.api", () => ({
  getUserCredentials: vi.fn(),
}));

import { getUserCredentials } from "../../api/user.api";
import { useUser } from "./useUser";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  picture: "https://example.com/pic.jpg",
};

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user credentials successfully", async () => {
    vi.mocked(getUserCredentials).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(getUserCredentials).toHaveBeenCalledOnce();
  });

  it("handles error with retry false", async () => {
    vi.mocked(getUserCredentials).mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // retry is false, so getUserCredentials should only be called once
    expect(getUserCredentials).toHaveBeenCalledTimes(1);
  });
});
