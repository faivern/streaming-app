import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/person.api", () => ({
  getEnrichedCredits: vi.fn(),
}));

import { getEnrichedCredits } from "../../api/person.api";
import { useEnrichedCredits } from "./useEnrichedCredits";

describe("useEnrichedCredits", () => {
  it("fetches enriched credits", async () => {
    vi.mocked(getEnrichedCredits).mockResolvedValue({ cast: [{ id: 1 }], crew: [] });
    const { result } = renderHook(() => useEnrichedCredits(1, "movie"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.cast).toHaveLength(1);
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(() => useEnrichedCredits(undefined, undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
