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
    resolve(__dirname, "../../assets/themes", themeName, `${pieceKey}.png`),
    resolve(__dirname, "../assets/themes", themeName, `${pieceKey}.png`),
    resolve(process.cwd(), "assets/themes", themeName, `${pieceKey}.png`),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));
  return match ?? candidates[0];
}

function createBuiltInTheme(themeName: PieceStyle): ThemeDefinition {
  return {
    name: themeName,
    displayName: themeName[0].toUpperCase() + themeName.slice(1),
    license: "Derived from upstream chess-image-generator resource pack; original pack license not fully verified",
    attribution:
      "Derived from andyruwruw/chess-image-generator bundled resources; upstream README cites Marcel van Kervinck as source",
    pieces: Object.fromEntries(
      PIECE_KEYS.map((pieceKey) => [
        pieceKey,
        {
          kind: "png",
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
