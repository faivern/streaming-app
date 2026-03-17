import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/lists.api", () => ({
  listsApi: {
    getUserLists: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import { listsApi } from "../../api/lists.api";
import { useUserLists, useListById } from "./useLists";

describe("useUserLists", () => {
  it("fetches user lists", async () => {
    vi.mocked(listsApi.getUserLists).mockResolvedValue([{ id: 1, name: "Favorites", items: [] }] as any);
    const { result } = renderHook(() => useUserLists(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useListById", () => {
  it("fetches list by id", async () => {
    vi.mocked(listsApi.getById).mockResolvedValue({ id: 1, name: "Test", items: [] } as any);
    const { result } = renderHook(() => useListById(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Test");
  });

  it("disabled when id undefined", () => {
    const { result } = renderHook(() => useListById(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
