import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { PieceKey, PieceStyle, ThemeDefinition } from "../types/types";
import { registerTheme } from "./registry";

export const builtInThemeNames = [
  "merida",
  "alpha",
  "cburnett",
  "cheq",
  "leipzig",
] as const satisfies readonly PieceStyle[];

const PIECE_KEYS: PieceKey[] = [
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

let initialized = false;

function assetPath(themeName: PieceStyle, pieceKey: PieceKey): string {
  const candidates = [
    resolve(__dirname, "../../assets/themes", themeName, `${pieceKey}.svg`),
    resolve(__dirname, "../assets/themes", themeName, `${pieceKey}.svg`),
    resolve(process.cwd(), "assets/themes", themeName, `${pieceKey}.svg`),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));
  return match ?? candidates[0];
}

function createBuiltInTheme(themeName: PieceStyle): ThemeDefinition {
  return {
    name: themeName,
    displayName: themeName[0].toUpperCase() + themeName.slice(1),
    license: "MIT",
    attribution: "Project-authored built-in SVG theme",
    pieces: Object.fromEntries(
      PIECE_KEYS.map((pieceKey) => [
        pieceKey,
        {
          kind: "svg",
          source: assetPath(themeName, pieceKey),
        },
      ]),
    ) as ThemeDefinition["pieces"],
  };
}

export function initializeBuiltInThemes(): void {
  if (initialized) {
    return;
  }

  for (const themeName of builtInThemeNames) {
    registerTheme(createBuiltInTheme(themeName));
  }

  initialized = true;
}

export function resetBuiltInThemesForTesting(): void {
  initialized = false;
}
