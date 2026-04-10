import type { HighlightInput, ResolvedHighlight } from "../types/types";
import { validateSquare } from "./validators";

export function normalizeHighlightEntries(input: HighlightInput[]): ResolvedHighlight[] {
  return input.map((entry) => {
    if (typeof entry === "string") {
      return {
        square: validateSquare(entry),
        style: "fill",
        color: undefined,
        opacity: undefined,
        lineWidth: undefined,
        radius: undefined,
      };
    }

    const style = entry.style ?? "fill";

    return {
      square: validateSquare(entry.square),
      style,
      color: entry.color ?? (style === "circle" ? "#ffcc00" : undefined),
      opacity: entry.opacity ?? (style === "circle" ? 0.9 : undefined),
      lineWidth: entry.lineWidth,
      radius: style === "circle" ? (entry.radius ?? 0.42) : undefined,
    };
  });
}
