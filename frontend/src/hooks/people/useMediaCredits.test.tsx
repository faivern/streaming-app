import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/credit.api", () => ({
  getMediaCredits: vi.fn(),
}));

import { getMediaCredits } from "../../api/credit.api";
import { useMediaCredits } from "./useMediaCredits";

describe("useMediaCredits", () => {
  it("fetches media credits", async () => {
    vi.mocked(getMediaCredits).mockResolvedValue({ cast: [{ id: 1, name: "Actor" }], crew: [] });
    const { result } = renderHook(() => useMediaCredits("movie", 123), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.cast).toHaveLength(1);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(() => useMediaCredits(undefined, undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
