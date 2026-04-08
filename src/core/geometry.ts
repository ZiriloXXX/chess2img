import type { Padding, Square } from "../types/types";
import { SQUARES } from "./board";

export interface SquareGeometry {
  x: number;
  y: number;
  size: number;
}

export interface BoardGeometry {
  imageWidth: number;
  imageHeight: number;
  squareSize: number;
  boardX: number;
  boardY: number;
  boardSize: number;
  squares: Record<Square, SquareGeometry>;
}

interface BoardGeometryOptions {
  size: number;
  padding: Padding;
  flipped: boolean;
}

export function createBoardGeometry({
  size,
  padding,
  flipped,
}: BoardGeometryOptions): BoardGeometry {
  const [top, right, bottom, left] = padding;
  const squareSize = size / 8;

  const squares = Object.fromEntries(
    SQUARES.map((square, index) => {
      const fileIndex = index % 8;
      const rankIndex = Math.floor(index / 8);

      const x = left + (flipped ? 7 - fileIndex : fileIndex) * squareSize;
      const y = top + (flipped ? 7 - rankIndex : rankIndex) * squareSize;

      return [square, { x, y, size: squareSize }];
    }),
  ) as Record<Square, SquareGeometry>;

  return {
    imageWidth: left + size + right,
    imageHeight: top + size + bottom,
    squareSize,
    boardX: left,
    boardY: top,
    boardSize: size,
    squares,
  };
}
