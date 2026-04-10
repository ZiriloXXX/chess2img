import type { BoardPosition } from "../core/board";
import type {
  Padding,
  ResolvedColors,
  ResolvedCoordinates,
  ResolvedHighlight,
  ThemeDefinition,
} from "../types/types";

export interface RenderRequest {
  board: BoardPosition;
  theme: ThemeDefinition;
  highlights: ResolvedHighlight[];
  size: number;
  padding: Padding;
  borderSize: number;
  flipped: boolean;
  colors: ResolvedColors;
  coordinates: ResolvedCoordinates;
}

export interface Renderer<TOutput> {
  render(request: RenderRequest): Promise<TOutput>;
}
