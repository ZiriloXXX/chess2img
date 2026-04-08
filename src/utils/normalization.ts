import type {
  BoardColors,
  Padding,
  RenderOptions,
  ResolvedColors,
  Square,
  ThemeDefinition,
} from "../types/types";
import { normalizeHighlights } from "../core/highlights";
import { normalizePadding, validateSize } from "../core/validators";
import { resolveTheme } from "../themes/resolver";

export const DEFAULT_SIZE = 480;
export const DEFAULT_PADDING: Padding = [0, 0, 0, 0];
export const DEFAULT_COLORS: ResolvedColors = {
  lightSquare: "#f0d9b5",
  darkSquare: "#b58863",
  highlight: "rgba(255, 206, 0, 0.45)",
};

export function normalizeColors(colors?: BoardColors): ResolvedColors {
  return {
    lightSquare: colors?.lightSquare ?? DEFAULT_COLORS.lightSquare,
    darkSquare: colors?.darkSquare ?? DEFAULT_COLORS.darkSquare,
    highlight: colors?.highlight ?? DEFAULT_COLORS.highlight,
  };
}

export function normalizeRenderInputs(options: RenderOptions & { highlightSquares?: Square[] }): {
  size: number;
  padding: Padding;
  flipped: boolean;
  theme: ThemeDefinition;
  highlightSquares: Square[];
  colors: ResolvedColors;
} {
  return {
    size: validateSize(options.size ?? DEFAULT_SIZE),
    padding: normalizePadding(options.padding ?? DEFAULT_PADDING),
    flipped: options.flipped ?? false,
    theme: resolveTheme({
      theme: options.theme,
      style: options.style,
    }),
    highlightSquares: normalizeHighlights(options.highlightSquares ?? []),
    colors: normalizeColors(options.colors),
  };
}
