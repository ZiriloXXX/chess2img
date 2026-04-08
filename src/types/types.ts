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

export interface RenderOptions {
  size?: number;
  padding?: Padding;
  flipped?: boolean;
  style?: PieceStyle;
  theme?: string | ThemeDefinition;
  highlightSquares?: Square[];
  colors?: BoardColors;
}

export interface ChessImageGeneratorOptions extends RenderOptions {}

export interface ResolvedColors {
  lightSquare: string;
  darkSquare: string;
  highlight: string;
}

export interface ResolvedRenderOptions {
  size: number;
  padding: Padding;
  flipped: boolean;
  theme: ThemeDefinition;
  highlightSquares: Square[];
  colors: ResolvedColors;
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
