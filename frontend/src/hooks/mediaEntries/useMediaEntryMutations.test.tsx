import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/mediaEntries.api", () => ({
  mediaEntriesApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsertReview: vi.fn(),
    deleteReview: vi.fn(),
  },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { mediaEntriesApi } from "../../api/mediaEntries.api";
import toast from "react-hot-toast";
import {
  useCreateMediaEntry,
  useDeleteMediaEntry,
} from "./useMediaEntryMutations";

describe("useMediaEntryMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useCreateMediaEntry: success shows toast (non-silent)", async () => {
    vi.mocked(mediaEntriesApi.create).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => useCreateMediaEntry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        tmdbId: 100,
        mediaType: "movie",
        status: "Watched",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Added to library!");
    });
  });

  it("useDeleteMediaEntry: success shows toast", async () => {
    vi.mocked(mediaEntriesApi.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteMediaEntry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Removed from library");
    });
  });

  it("useDeleteMediaEntry: 401 error shows sign in", async () => {
    const error = Object.assign(new Error(), { response: { status: 401 } });
    vi.mocked(mediaEntriesApi.delete).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteMediaEntry(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please sign in");
    });
  });
});
