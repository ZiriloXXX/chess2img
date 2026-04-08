import { describe, expect, it } from "vitest";
import {
  builtInThemeNames,
  initializeBuiltInThemes,
  resetBuiltInThemesForTesting,
} from "../../src/themes/builtins";
import { clearThemeRegistryForTesting, getTheme, registerTheme } from "../../src/themes/registry";
import { resolveTheme } from "../../src/themes/resolver";
import { validateThemeDefinition } from "../../src/themes/validation";
import { ThemeError, ValidationError } from "../../src/types/errors";
import type { PieceKey, ThemeDefinition } from "../../src/types/types";

const PIECES: PieceKey[] = [
  "wK",
  "wQ",
  "wR",
  "wB",
  "wN",
  "wP",
  "bK",
  "bQ",
  "bR",
  "bB",
  "bN",
  "bP",
];

function createTheme(name: string): ThemeDefinition {
  return {
    name,
    displayName: name,
    license: "MIT",
    attribution: "Project-authored",
    pieces: Object.fromEntries(
      PIECES.map((piece) => [
        piece,
        {
          kind: "svg",
          source: `/virtual/${name}/${piece}.svg`,
        },
      ]),
    ) as ThemeDefinition["pieces"],
  };
}

describe("validateThemeDefinition", () => {
  it("rejects invalid names", () => {
    expect(() => validateThemeDefinition(createTheme("Bad Name"))).toThrow(ValidationError);
  });

  it("rejects incomplete piece maps", () => {
    const invalid = createTheme("custom");
    delete (invalid.pieces as Partial<typeof invalid.pieces>).wK;
    expect(() => validateThemeDefinition(invalid)).toThrow(ThemeError);
  });
});

describe("theme registry", () => {
  it("rejects duplicate names", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    registerTheme(createTheme("custom"));
    expect(() => registerTheme(createTheme("custom"))).toThrow(ThemeError);
  });
});

describe("built-in themes", () => {
  it("registers all bundled themes", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    initializeBuiltInThemes();

    expect(builtInThemeNames).toEqual([
      "merida",
      "alpha",
      "cburnett",
      "cheq",
      "leipzig",
    ]);
    expect(getTheme("merida")?.name).toBe("merida");
    expect(getTheme("leipzig")?.pieces.bQ.kind).toBe("svg");
  });
});

describe("resolveTheme", () => {
  it("defaults to merida", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    initializeBuiltInThemes();

    expect(resolveTheme({}).name).toBe("merida");
  });

  it("resolves a built-in style alias", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    initializeBuiltInThemes();

    expect(resolveTheme({ style: "alpha" }).name).toBe("alpha");
  });

  it("prefers an inline theme definition over a named theme", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    initializeBuiltInThemes();
    const inlineTheme = createTheme("inline-theme");

    expect(
      resolveTheme({
        theme: inlineTheme,
        style: "merida",
      }).name,
    ).toBe("inline-theme");
  });

  it("rejects malformed inline theme definitions as ThemeError", () => {
    clearThemeRegistryForTesting();
    resetBuiltInThemesForTesting();
    initializeBuiltInThemes();
    const invalidInlineTheme = createTheme("inline-theme");
    delete (invalidInlineTheme.pieces as Partial<typeof invalidInlineTheme.pieces>).wK;

    expect(() =>
      resolveTheme({
        theme: invalidInlineTheme,
      }),
    ).toThrow(ThemeError);
  });
});
