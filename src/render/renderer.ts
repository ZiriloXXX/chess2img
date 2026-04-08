import type { BoardPosition } from "../core/board";
import type { Padding, ResolvedColors, Square, ThemeDefinition } from "../types/types";

export interface RenderRequest {
  board: BoardPosition;
  theme: ThemeDefinition;
  highlights: Square[];
  size: number;
  padding: Padding;
  flipped: boolean;
  colors: ResolvedColors;
}

export interface Renderer<TOutput> {
  render(request: RenderRequest): Promise<TOutput>;
}
