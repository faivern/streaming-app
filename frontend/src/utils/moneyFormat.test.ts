import { describe, it, expect } from "vitest";
import { moneyFormat } from "./moneyFormat";

describe("moneyFormat", () => {
  it("formats zero as '$0'", () => {
    expect(moneyFormat(0)).toBe("$0");
  });

  it("formats billions", () => {
    expect(moneyFormat(2_500_000_000)).toBe("2.5B USD");
  });

  it("formats millions", () => {
    expect(moneyFormat(150_000_000)).toBe("150.0M USD");
  });

  it("formats thousands", () => {
    expect(moneyFormat(45_000)).toBe("45.0K USD");
  });

  it("returns raw number for sub-thousand values", () => {
    expect(moneyFormat(999)).toBe("999");
  });

  it("returns 'Invalid amount' for negative values", () => {
    expect(moneyFormat(-100)).toBe("Invalid amount");
  });

  it("handles exact boundaries", () => {
    expect(moneyFormat(1_000)).toBe("1.0K USD");
    expect(moneyFormat(1_000_000)).toBe("1.0M USD");
    expect(moneyFormat(1_000_000_000)).toBe("1.0B USD");
  });
});
