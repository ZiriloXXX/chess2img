import { describe, expect, it } from "vitest";
import { normalizeHighlightEntries } from "../../src/core/highlights";

describe("normalizeHighlightEntries", () => {
  it("normalizes highlights while preserving order and duplicates", () => {
    expect(normalizeHighlightEntries(["E4", "d5", "e4"])).toEqual([
      { square: "e4", style: "fill" },
      { square: "d5", style: "fill" },
      { square: "e4", style: "fill" },
    ]);
  });

  it("supports clearing with an empty list", () => {
    expect(normalizeHighlightEntries([])).toEqual([]);
  });
});
