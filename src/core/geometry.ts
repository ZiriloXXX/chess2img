import type { Padding, Square } from "../types/types";
import { FILES, RANKS, SQUARES } from "./board";

export interface SquareGeometry {
  x: number;
  y: number;
  size: number;
}

export interface CoordinateLabelGeometry {
  text: string;
  x: number;
  y: number;
  square: Square;
  textAlign: "left" | "center";
  textBaseline: "top" | "middle" | "bottom";
}

export interface BoardGeometry {
  imageWidth: number;
  imageHeight: number;
  squareSize: number;
  borderSize: number;
  boardOuterX: number;
  boardOuterY: number;
  boardOuterSize: number;
  boardX: number;
  boardY: number;
  boardSize: number;
  borderFileLabels: CoordinateLabelGeometry[];
  borderRankLabels: CoordinateLabelGeometry[];
  insideFileLabels: CoordinateLabelGeometry[];
  insideRankLabels: CoordinateLabelGeometry[];
  insideFileInsetX: number;
  insideFileInsetY: number;
  insideRankInsetX: number;
  insideRankInsetY: number;
  insideLabelMaxWidth: number;
  insideLabelMaxHeight: number;
  squares: Record<Square, SquareGeometry>;
}

interface BoardGeometryOptions {
  size: number;
  padding: Padding;
  borderSize: number;
  flipped: boolean;
}

export function createBoardGeometry({
  size,
  padding,
  borderSize,
  flipped,
}: BoardGeometryOptions): BoardGeometry {
  const [top, right, bottom, left] = padding;
  const boardOuterSize = size;
  const boardOuterX = left;
  const boardOuterY = top;
  const boardX = left + borderSize;
  const boardY = top + borderSize;
  const boardSize = size - borderSize * 2;
  const squareSize = boardSize / 8;

  const squares = Object.fromEntries(
    SQUARES.map((square, index) => {
      const fileIndex = index % 8;
      const rankIndex = Math.floor(index / 8);

      const x = boardX + (flipped ? 7 - fileIndex : fileIndex) * squareSize;
      const y = boardY + (flipped ? 7 - rankIndex : rankIndex) * squareSize;

      return [square, { x, y, size: squareSize }];
    }),
  ) as Record<Square, SquareGeometry>;

  const displayedFiles = flipped ? [...FILES].reverse() : [...FILES];
  const displayedRanks = flipped ? [...RANKS].reverse() : [...RANKS];
  const bottomEdgeRank = flipped ? "8" : "1";
  const leftEdgeFile = flipped ? "h" : "a";
  const borderFileLabels = borderSize
    ? displayedFiles.map((file, fileIndex) => ({
        text: file,
        x: boardX + fileIndex * squareSize + squareSize / 2,
        y: boardOuterY + boardOuterSize - borderSize / 2,
        square: `${file}${bottomEdgeRank}` as Square,
        textAlign: "center" as const,
        textBaseline: "middle" as const,
      }))
    : [];
  const borderRankLabels = borderSize
    ? displayedRanks.map((rank, rankIndex) => ({
        text: rank,
        x: boardOuterX + borderSize / 2,
        y: boardY + rankIndex * squareSize + squareSize / 2,
        square: `${leftEdgeFile}${rank}` as Square,
        textAlign: "center" as const,
        textBaseline: "middle" as const,
      }))
    : [];
  const insideFileInsetX = squareSize * 0.14;
  const insideFileInsetY = squareSize * 0.1;
  const insideRankInsetX = squareSize * 0.14;
  const insideRankInsetY = squareSize * 0.1;
  const insideLabelMaxWidth = squareSize * 0.26;
  const insideLabelMaxHeight = squareSize * 0.24;
  const insideFileLabels = displayedFiles.map((file) => {
    const square = `${file}${bottomEdgeRank}` as Square;
    const squareGeometry = squares[square];

    return {
      text: file,
      x: squareGeometry.x + insideFileInsetX,
      y: squareGeometry.y + squareGeometry.size - insideFileInsetY,
      square,
      textAlign: "left" as const,
      textBaseline: "bottom" as const,
    };
  });
  const insideRankLabels = displayedRanks.map((rank) => {
    const square = `${leftEdgeFile}${rank}` as Square;
    const squareGeometry = squares[square];

    return {
      text: rank,
      x: squareGeometry.x + insideRankInsetX,
      y: squareGeometry.y + insideRankInsetY,
      square,
      textAlign: "left" as const,
      textBaseline: "top" as const,
    };
  });

  return {
    imageWidth: left + size + right,
    imageHeight: top + size + bottom,
    squareSize,
    borderSize,
    boardOuterX,
    boardOuterY,
    boardOuterSize,
    boardX,
    boardY,
    boardSize,
    borderFileLabels,
    borderRankLabels,
    insideFileLabels,
    insideRankLabels,
    insideFileInsetX,
    insideFileInsetY,
    insideRankInsetX,
    insideRankInsetY,
    insideLabelMaxWidth,
    insideLabelMaxHeight,
    squares,
  };
}
