export type Square = string;

export type PieceStyle =
  | "merida"
  | "alpha"
  | "cburnett"
  | "cheq"
  | "leipzig";

export type Padding = [number, number, number, number];

export type BoardCell = string | null;

export type BoardArray = BoardCell[][];

export type PieceKey =
  | "wK"
  | "wQ"
  | "wR"
  | "wB"
  | "wN"
  | "wP"
  | "bK"
  | "bQ"
  | "bR"
  | "bB"
  | "bN"
  | "bP";

export interface SvgAssetSource {
  kind: "svg";
  source: string;
}

export interface PngAssetSource {
  kind: "png";
  source: string;
}

export type ThemeAssetSource = SvgAssetSource | PngAssetSource;

export interface ThemeDefinition {
  name: string;
  displayName: string;
  license: string;
  attribution: string;
  pieces: Record<PieceKey, ThemeAssetSource>;
}

export interface BoardColors {
  lightSquare?: string;
  darkSquare?: string;
  highlight?: string;
}

export type HighlightStyle = "fill" | "circle";

export interface HighlightOptions {
  square: string;
  style?: HighlightStyle;
  color?: string;
  opacity?: number;
  lineWidth?: number;
}

export type HighlightInput = string | HighlightOptions;

export interface ResolvedHighlight {
  square: Square;
  style: HighlightStyle;
  color?: string;
  opacity?: number;
  lineWidth?: number;
}

export type CoordinatesPosition = "border" | "inside";

export interface CoordinatesOptions {
  enabled?: boolean;
  position?: CoordinatesPosition;
  color?: string;
}

export type CoordinatesInput =
  | boolean
  | CoordinatesPosition
  | CoordinatesOptions;

export interface RenderOptions {
  size?: number;
  padding?: Padding;
  borderSize?: number;
  flipped?: boolean;
  style?: PieceStyle;
  theme?: string | ThemeDefinition;
  highlights?: HighlightInput[];
  highlightSquares?: HighlightInput[];
  colors?: BoardColors;
  coordinates?: CoordinatesInput;
}

export interface ChessImageGeneratorOptions extends RenderOptions {}

export interface ResolvedColors {
  lightSquare: string;
  darkSquare: string;
  highlight: string;
}

export interface ResolvedCoordinates {
  enabled: boolean;
  position: CoordinatesPosition;
  color?: string;
}

export interface ResolvedRenderOptions {
  size: number;
  padding: Padding;
  borderSize: number;
  flipped: boolean;
  theme: ThemeDefinition;
  highlights: ResolvedHighlight[];
  colors: ResolvedColors;
  coordinates: ResolvedCoordinates;
}

interface FENRenderInput extends RenderOptions {
  fen: string;
  pgn?: never;
  board?: never;
}

interface PGNRenderInput extends RenderOptions {
  fen?: never;
  pgn: string;
  board?: never;
}

interface BoardRenderInput extends RenderOptions {
  fen?: never;
  pgn?: never;
  board: BoardArray;
}

export type RenderChessOptions = FENRenderInput | PGNRenderInput | BoardRenderInput;
