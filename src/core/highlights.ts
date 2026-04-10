import type { HighlightInput, ResolvedHighlight } from "../types/types";
import { validateSquare } from "./validators";

export function normalizeHighlightEntries(input: HighlightInput[]): ResolvedHighlight[] {
  return input.map((entry) => {
    if (typeof entry === "string") {
      return {
        square: validateSquare(entry),
        style: "fill",
      };
    }

    const style = entry.style ?? "fill";

    return {
      square: validateSquare(entry.square),
      style,
      color: entry.color ?? (style === "circle" ? "#ffcc00" : undefined),
      opacity: entry.opacity ?? (style === "circle" ? 0.9 : undefined),
      lineWidth: entry.lineWidth,
    };
  });
}
