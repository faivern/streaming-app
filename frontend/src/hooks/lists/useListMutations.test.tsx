import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/lists.api", () => ({
  listsApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { listsApi } from "../../api/lists.api";
import toast from "react-hot-toast";
import {
  useCreateList,
  useUpdateList,
  useDeleteList,
  useAddListItem,
  useRemoveListItem,
} from "./useListMutations";

describe("useListMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- useCreateList ---

  it("useCreateList: success shows toast", async () => {
    vi.mocked(listsApi.create).mockResolvedValue({ id: 1, name: "My List" } as any);

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "My List", isPublic: false });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("List created!");
    });
  });

  it("useCreateList: 401 error shows sign in message", async () => {
    const error = Object.assign(new Error(), { response: { status: 401 } });
    vi.mocked(listsApi.create).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "My List", isPublic: false });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please sign in to create lists"
      );
    });
  });

  it("useCreateList: 409 error shows max lists message", async () => {
    const error = Object.assign(new Error(), { response: { status: 409 } });
    vi.mocked(listsApi.create).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "My List", isPublic: false });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You've reached the maximum of 20 lists"
      );
    });
  });

  // --- useUpdateList ---

  it("useUpdateList: success shows toast", async () => {
    vi.mocked(listsApi.update).mockResolvedValue({} as any);

    const { result } = renderHook(() => useUpdateList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 1, data: { name: "Updated" } });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("List updated!");
    });
  });

  it("useUpdateList: 404 error shows not found", async () => {
    const error = Object.assign(new Error(), { response: { status: 404 } });
    vi.mocked(listsApi.update).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 999, data: { name: "Updated" } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("List not found");
    });
  });

  // --- useDeleteList ---

  it("useDeleteList: success shows toast", async () => {
    vi.mocked(listsApi.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("List deleted");
    });
  });

  it("useDeleteList: 404 error", async () => {
    const error = Object.assign(new Error(), { response: { status: 404 } });
    vi.mocked(listsApi.delete).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(999);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("List not found");
    });
  });

  // --- useAddListItem ---

  it("useAddListItem: success shows toast (non-silent)", async () => {
    vi.mocked(listsApi.addItem).mockResolvedValue({} as any);

    const { result } = renderHook(() => useAddListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        listId: 1,
        item: { tmdbId: 100, mediaType: "movie" },
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Added to list!");
    });
  });

  it("useAddListItem: silent mode suppresses toast", async () => {
    vi.mocked(listsApi.addItem).mockResolvedValue({} as any);

    const { result } = renderHook(() => useAddListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        listId: 1,
        item: { tmdbId: 100, mediaType: "movie" },
        silent: true,
      });
    });

    await waitFor(() => {
      expect(listsApi.addItem).toHaveBeenCalled();
    });

    // Give time for onSuccess to run (or not)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("useAddListItem: 409 error", async () => {
    const error = Object.assign(new Error(), {
      response: { status: 409, data: "Already in this list" },
    });
    vi.mocked(listsApi.addItem).mockRejectedValue(error);

    const { result } = renderHook(() => useAddListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        listId: 1,
        item: { tmdbId: 100, mediaType: "movie" },
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Already in this list");
    });
  });

  // --- useRemoveListItem ---

  it("useRemoveListItem: success shows toast", async () => {
    vi.mocked(listsApi.removeItem).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ listId: 1, itemId: 5 });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Removed from list");
    });
  });

  it("useRemoveListItem: 404 error", async () => {
    const error = Object.assign(new Error(), { response: { status: 404 } });
    vi.mocked(listsApi.removeItem).mockRejectedValue(error);

    const { result } = renderHook(() => useRemoveListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ listId: 1, itemId: 999 });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Item not found");
    });
  });

  it("useRemoveListItem: 401 error", async () => {
    const error = Object.assign(new Error(), { response: { status: 401 } });
    vi.mocked(listsApi.removeItem).mockRejectedValue(error);

    const { result } = renderHook(() => useRemoveListItem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ listId: 1, itemId: 5 });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please sign in");
    });
  });
});
