import { describe, expect, it } from "vitest";
import { normalizeHighlights } from "../../src/core/highlights";

describe("normalizeHighlights", () => {
  it("validates, deduplicates, and sorts deterministically", () => {
    expect(normalizeHighlights(["E4", "d5", "e4"])).toEqual(["d5", "e4"]);
  });

  it("supports clearing with an empty list", () => {
    expect(normalizeHighlights([])).toEqual([]);
  });
});
