import type {
  BoardColors,
  CoordinatesInput,
  CoordinatesOptions,
  CoordinatesPosition,
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
  position: "inside",
};

export function normalizeColors(colors?: BoardColors): ResolvedColors {
  return {
    lightSquare: colors?.lightSquare ?? DEFAULT_COLORS.lightSquare,
    darkSquare: colors?.darkSquare ?? DEFAULT_COLORS.darkSquare,
    highlight: colors?.highlight ?? DEFAULT_COLORS.highlight,
  };
}

export function normalizeCoordinates(
  coordinates: CoordinatesInput | undefined,
  borderSize: number,
): ResolvedCoordinates {
  if (coordinates === undefined || coordinates === false) {
    return { ...DEFAULT_COORDINATES };
  }

  const defaultPosition: CoordinatesPosition =
    borderSize > 0 ? "border" : "inside";

  if (coordinates === true) {
    return {
      enabled: true,
      position: defaultPosition,
      color: defaultPosition === "border" ? "#333" : undefined,
    };
  }

  if (coordinates === "border" || coordinates === "inside") {
    return {
      enabled: true,
      position: coordinates,
      color: coordinates === "border" ? "#333" : undefined,
    };
  }

  const position = coordinates.position ?? defaultPosition;

  return {
    enabled: coordinates.enabled ?? true,
    position,
    color: coordinates.color ?? (position === "border" ? "#333" : undefined),
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
  validateCoordinatesOption(options.coordinates, borderSize);

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
    coordinates: normalizeCoordinates(options.coordinates, borderSize),
  };
}
