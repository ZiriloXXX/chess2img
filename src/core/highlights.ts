import type { Square } from "../types/types";
import { validateSquare } from "./validators";

export function normalizeHighlights(input: string[]): Square[] {
  return [...new Set(input.map(validateSquare))].sort();
}
