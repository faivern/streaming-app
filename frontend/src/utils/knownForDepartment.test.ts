import { describe, it, expect } from "vitest";
import { knownForDepartment } from "./knownForDepartment";

describe("knownForDepartment", () => {
  it("returns 'Actor' for Acting with male gender", () => {
    expect(knownForDepartment("Acting", 2)).toBe("Actor");
  });

  it("returns 'Actress' for Acting with female gender", () => {
    expect(knownForDepartment("Acting", 1)).toBe("Actress");
  });

  it("returns 'Director' for Directing", () => {
    expect(knownForDepartment("Directing")).toBe("Director");
  });

  it("returns 'Writer' for Writing", () => {
    expect(knownForDepartment("Writing")).toBe("Writer");
  });

  it("returns 'Crew' for unknown department", () => {
    expect(knownForDepartment("Sound")).toBe("Crew");
  });

  it("returns 'Crew' when department is undefined", () => {
    expect(knownForDepartment(undefined)).toBe("Crew");
  });
});
