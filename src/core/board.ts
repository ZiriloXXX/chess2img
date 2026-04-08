import type { PieceKey, Square } from "../types/types";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

export const SQUARES: Square[] = RANKS.flatMap((rank) =>
  FILES.map((file) => `${file}${rank}`),
);

export interface BoardPosition {
  squares: Record<Square, PieceKey | null>;
}

export function createEmptyBoardPosition(): BoardPosition {
  return {
    squares: Object.fromEntries(
      SQUARES.map((square) => [square, null]),
    ) as Record<Square, PieceKey | null>,
  };
}
