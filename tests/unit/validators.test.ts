import { describe, expect, it } from "vitest";
import {
  validateBoardColors,
  validateBorderSize,
  normalizePadding,
  validateBoardArray,
  validateCoordinatesOption,
  validateColorString,
  validateHighlightOptions,
  validateHighlightsInput,
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

describe("validateBorderSize", () => {
  it("accepts a border size within the safe range", () => {
    expect(validateBorderSize(24, 480)).toBe(24);
  });

  it("rejects negative border sizes", () => {
    expect(() => validateBorderSize(-1, 480)).toThrow(ValidationError);
  });

  it("rejects border sizes that exceed the safe maximum", () => {
    expect(() => validateBorderSize(61, 480)).toThrow(ValidationError);
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

describe("validateColorString", () => {
  it("accepts CSS color values", () => {
    expect(validateColorString("#333", "coordinate color")).toBe("#333");
    expect(validateColorString("rgba(255, 206, 0, 0.45)", "highlight")).toBe(
      "rgba(255, 206, 0, 0.45)",
    );
  });

  it("rejects invalid CSS color values", () => {
    expect(() => validateColorString("not-a-color", "coordinate color")).toThrow(
      ValidationError,
    );
  });
});

describe("validateBoardColors", () => {
  it("accepts board color overrides when all colors are valid", () => {
    expect(() =>
      validateBoardColors({
        lightSquare: "#EEEED2",
        darkSquare: "#769656",
        highlight: "rgba(246, 246, 105, 0.6)",
      }),
    ).not.toThrow();
  });

  it("rejects invalid board colors", () => {
    expect(() => validateBoardColors({ lightSquare: "bogus" })).toThrow(
      ValidationError,
    );
  });
});

describe("validateCoordinatesOption", () => {
  it("accepts booleans, string modes, and valid object shapes", () => {
    expect(() => validateCoordinatesOption(false, 0)).not.toThrow();
    expect(() => validateCoordinatesOption(true, 0)).not.toThrow();
    expect(() => validateCoordinatesOption("inside", 0)).not.toThrow();
    expect(() => validateCoordinatesOption("border", 24)).not.toThrow();
    expect(() =>
      validateCoordinatesOption({
        enabled: true,
        position: "inside",
        color: "#333",
      }, 0),
    ).not.toThrow();
  });

  it("rejects invalid coordinates option shapes", () => {
    expect(() => validateCoordinatesOption("true" as never, 0)).toThrow(
      ValidationError,
    );
    expect(() => validateCoordinatesOption({ enabled: "yes" } as never, 0)).toThrow(
      ValidationError,
    );
    expect(() => validateCoordinatesOption({ color: "bogus" }, 0)).toThrow(
      ValidationError,
    );
    expect(() => validateCoordinatesOption("border", 0)).toThrow(ValidationError);
    expect(
      () => validateCoordinatesOption({ position: "border" }, 0),
    ).toThrow(ValidationError);
  });
});

describe("validateHighlightOptions", () => {
  it("accepts square strings and valid object highlights", () => {
    expect(() => validateHighlightOptions(["e4"])).not.toThrow();
    expect(() =>
      validateHighlightOptions([
        { square: "e4" },
        { square: "d5", style: "circle", color: "#ffcc00", opacity: 0.5, lineWidth: 4 },
      ]),
    ).not.toThrow();
  });

  it("rejects malformed highlight entries", () => {
    expect(() => validateHighlightOptions(["z9"])).toThrow(ValidationError);
    expect(() => validateHighlightOptions([{ square: "e4", style: "ring" } as never])).toThrow(
      ValidationError,
    );
    expect(() => validateHighlightOptions([{ square: "e4", opacity: 1.5 }])).toThrow(
      ValidationError,
    );
    expect(() => validateHighlightOptions([{ square: "e4", lineWidth: 0 }])).toThrow(
      ValidationError,
    );
    expect(() => validateHighlightOptions([{ color: "#ffcc00" } as never])).toThrow(
      ValidationError,
    );
  });
});

describe("validateHighlightsInput", () => {
  it("accepts either highlights or highlightSquares individually", () => {
    expect(() => validateHighlightsInput(["e4"], undefined)).not.toThrow();
    expect(() => validateHighlightsInput(undefined, ["e4"])).not.toThrow();
  });

  it("rejects using highlights and highlightSquares together", () => {
    expect(() => validateHighlightsInput(["e4"], ["d5"])).toThrow(ValidationError);
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
