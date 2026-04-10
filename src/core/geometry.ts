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
  fileLabels: CoordinateLabelGeometry[];
  rankLabels: CoordinateLabelGeometry[];
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
  const fileLabels = borderSize
    ? displayedFiles.map((file, fileIndex) => ({
        text: file,
        x: boardX + fileIndex * squareSize + squareSize / 2,
        y: boardOuterY + boardOuterSize - borderSize / 2,
      }))
    : [];
  const rankLabels = borderSize
    ? displayedRanks.map((rank, rankIndex) => ({
        text: rank,
        x: boardOuterX + borderSize / 2,
        y: boardY + rankIndex * squareSize + squareSize / 2,
      }))
    : [];

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
    fileLabels,
    rankLabels,
    squares,
  };
}
