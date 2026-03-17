import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../../test/queryWrapper";

vi.mock("../../api/images.api", () => ({
  getLogoImages: vi.fn(),
}));

import { getLogoImages } from "../../api/images.api";
import { useMediaLogo } from "./useMediaLogo";

describe("useMediaLogo", () => {
  it("returns English logo file path", async () => {
    vi.mocked(getLogoImages).mockResolvedValue({
      logos: [
        { file_path: "/other.png", iso_639_1: "fr" },
        { file_path: "/en-logo.png", iso_639_1: "en" },
      ],
    });
    const { result } = renderHook(() => useMediaLogo("movie", 123), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("/en-logo.png");
  });

  it("disabled when params missing", () => {
    const { result } = renderHook(() => useMediaLogo(undefined, undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
