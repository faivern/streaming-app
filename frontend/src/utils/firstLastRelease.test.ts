import { describe, it, expect } from "vitest";
import { firstLastRelease } from "./firstLastRelease";

describe("firstLastRelease", () => {
  it("finds first and last year from multiple parts", () => {
    const parts = [
      { release_date: "2020-05-01" },
      { release_date: "2015-01-01" },
      { release_date: "2023-12-25" },
    ];
    expect(firstLastRelease(parts)).toEqual({ first: 2015, last: 2023 });
  });

  it("returns nulls for empty array", () => {
    expect(firstLastRelease([])).toEqual({ first: null, last: null });
  });

  it("returns nulls for undefined", () => {
    expect(firstLastRelease(undefined)).toEqual({ first: null, last: null });
  });

  it("handles a single part", () => {
    const parts = [{ release_date: "2021-06-15" }];
    expect(firstLastRelease(parts)).toEqual({ first: 2021, last: 2021 });
  });

  it("returns Infinity/-Infinity when all parts have missing dates", () => {
    const parts = [{ release_date: undefined }, { release_date: undefined }];
    expect(firstLastRelease(parts)).toEqual({ first: Infinity, last: -Infinity });
  });
});
