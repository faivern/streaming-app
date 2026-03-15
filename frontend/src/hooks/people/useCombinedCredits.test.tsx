import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/person.api", () => ({
  getCombinedCredits: vi.fn(),
}));

import { getCombinedCredits } from "../../api/person.api";
import { useCombinedCredits } from "./useCombinedCredits";

describe("useCombinedCredits", () => {
  it("fetches combined credits", async () => {
    vi.mocked(getCombinedCredits).mockResolvedValue({ cast: [{ id: 1 }], crew: [] });
    const { result } = renderHook(() => useCombinedCredits(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.cast).toHaveLength(1);
  });

  it("disabled when personId undefined", () => {
    const { result } = renderHook(() => useCombinedCredits(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
