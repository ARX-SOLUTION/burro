import { describe, expect, it } from "vitest";
import { coerceLanguage } from "./drizzle-exercise.catalog";

describe("coerceLanguage", () => {
  it("returns supported languages as-is", () => {
    expect(coerceLanguage("uz")).toBe("uz");
    expect(coerceLanguage("ru")).toBe("ru");
    expect(coerceLanguage("en")).toBe("en");
  });

  it("falls back to uz for null/undefined/empty", () => {
    expect(coerceLanguage(null)).toBe("uz");
    expect(coerceLanguage(undefined)).toBe("uz");
    expect(coerceLanguage("")).toBe("uz");
  });

  it("falls back to uz for unsupported values rather than passing them through", () => {
    expect(coerceLanguage("fr")).toBe("uz");
    expect(coerceLanguage("EN")).toBe("uz");
    expect(coerceLanguage("uzbek")).toBe("uz");
  });
});
