import { describe, expect, it } from "vitest";
import {
  normalizePadding,
  validateBoardArray,
  validateSize,
  validateSquare,
} from "../../src/core/validators";
import { ValidationError } from "../../src/types/errors";

describe("validateSize", () => {
  it("accepts positive board sizes", () => {
    expect(validateSize(480)).toBe(480);
  });

  it("rejects invalid board sizes", () => {
    expect(() => validateSize(0)).toThrow(ValidationError);
  });
});

describe("normalizePadding", () => {
  it("accepts four-value tuples", () => {
    expect(normalizePadding([10, 20, 30, 40])).toEqual([10, 20, 30, 40]);
  });

  it("rejects invalid tuples", () => {
    expect(() => normalizePadding([10, 20, 30] as never)).toThrow(ValidationError);
  });
});

describe("validateSquare", () => {
  it("accepts valid coordinates and normalizes case", () => {
    expect(validateSquare("E4")).toBe("e4");
  });

  it("rejects invalid coordinates", () => {
    expect(() => validateSquare("z9")).toThrow(ValidationError);
  });
});

describe("validateBoardArray", () => {
  it("accepts an 8x8 board", () => {
    expect(
      validateBoardArray(
        Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      ),
    ).toHaveLength(8);
  });

  it("rejects invalid dimensions", () => {
    expect(() => validateBoardArray([["K"]] as never)).toThrow(ValidationError);
  });
});
