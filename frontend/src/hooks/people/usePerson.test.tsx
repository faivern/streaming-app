import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/person.api", () => ({
  getPersonDetails: vi.fn(),
}));

import { getPersonDetails } from "../../api/person.api";
import { usePerson } from "./usePerson";

describe("usePerson", () => {
  it("fetches person details", async () => {
    vi.mocked(getPersonDetails).mockResolvedValue({ id: 1, name: "Actor", birthday: "1990-01-01" });
    const { result } = renderHook(() => usePerson(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Actor");
  });

  it("disabled when personId undefined", () => {
    const { result } = renderHook(() => usePerson(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
