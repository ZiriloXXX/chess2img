import { validateThemeName } from "../core/validators";
import { ThemeError, ValidationError } from "../types/errors";
import type { PieceKey, ThemeDefinition } from "../types/types";

const REQUIRED_PIECES: PieceKey[] = [
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

export function validateThemeDefinition(theme: ThemeDefinition): ThemeDefinition {
  const normalizedName = validateThemeName(theme.name);

  if (!theme.displayName.trim()) {
    throw new ValidationError("Theme displayName is required");
  }

  if (!theme.license.trim()) {
    throw new ValidationError("Theme license is required");
  }

  if (!theme.attribution.trim()) {
    throw new ValidationError("Theme attribution is required");
  }

  for (const pieceKey of REQUIRED_PIECES) {
    const asset = theme.pieces[pieceKey];

    if (!asset || (asset.kind !== "svg" && asset.kind !== "png") || !asset.source.trim()) {
      throw new ThemeError(`Theme "${normalizedName}" is missing asset ${pieceKey}`);
    }
  }

  return {
    ...theme,
    name: normalizedName,
  };
}
