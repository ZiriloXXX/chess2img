import type {
  BoardColors,
  CoordinatesOptions,
  Padding,
  RenderOptions,
  ResolvedColors,
  ResolvedCoordinates,
  ResolvedRenderOptions,
  Square,
  ThemeDefinition,
} from "../types/types";
import { normalizeHighlights } from "../core/highlights";
import {
  normalizePadding,
  validateBoardColors,
  validateBorderSize,
  validateCoordinatesOption,
  validateSize,
} from "../core/validators";
import { resolveTheme } from "../themes/resolver";

export const DEFAULT_SIZE = 480;
export const DEFAULT_PADDING: Padding = [0, 0, 0, 0];
export const DEFAULT_BORDER_SIZE = 0;
export const DEFAULT_COLORS: ResolvedColors = {
  lightSquare: "#f0d9b5",
  darkSquare: "#b58863",
  highlight: "rgba(255, 206, 0, 0.45)",
};
export const DEFAULT_COORDINATES: ResolvedCoordinates = {
  enabled: false,
  color: "#333",
};

export function normalizeColors(colors?: BoardColors): ResolvedColors {
  return {
    lightSquare: colors?.lightSquare ?? DEFAULT_COLORS.lightSquare,
    darkSquare: colors?.darkSquare ?? DEFAULT_COLORS.darkSquare,
    highlight: colors?.highlight ?? DEFAULT_COLORS.highlight,
  };
}

export function normalizeCoordinates(
  coordinates?: boolean | CoordinatesOptions,
): ResolvedCoordinates {
  if (coordinates === undefined || coordinates === false) {
    return { ...DEFAULT_COORDINATES };
  }

  if (coordinates === true) {
    return {
      enabled: true,
      color: DEFAULT_COORDINATES.color,
    };
  }

  return {
    enabled: coordinates.enabled ?? true,
    color: coordinates.color ?? DEFAULT_COORDINATES.color,
  };
}

export function normalizeRenderInputs(
  options: RenderOptions & { highlightSquares?: Square[] },
): ResolvedRenderOptions {
  const size = validateSize(options.size ?? DEFAULT_SIZE);
  const borderSize = validateBorderSize(
    options.borderSize ?? DEFAULT_BORDER_SIZE,
    size,
  );
  validateBoardColors(options.colors);
  validateCoordinatesOption(options.coordinates);

  return {
    size,
    padding: normalizePadding(options.padding ?? DEFAULT_PADDING),
    borderSize,
    flipped: options.flipped ?? false,
    theme: resolveTheme({
      theme: options.theme,
      style: options.style,
    }),
    highlightSquares: normalizeHighlights(options.highlightSquares ?? []),
    colors: normalizeColors(options.colors),
    coordinates: normalizeCoordinates(options.coordinates),
  };
}
