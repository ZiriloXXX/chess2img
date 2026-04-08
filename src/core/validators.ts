import type { BoardArray, BoardCell, Padding, Square } from "../types/types";
import { ValidationError } from "../types/errors";

const SQUARE_PATTERN = /^[a-h][1-8]$/;
const PIECE_PATTERN = /^[prnbqkPRNBQK]$/;
const BUILT_IN_THEME_PATTERN = /^(merida|alpha|cburnett|cheq|leipzig)$/;

export function validateSize(size: number): number {
  if (!Number.isFinite(size) || size <= 0) {
    throw new ValidationError(`Invalid board size: ${size}`);
  }

  return Math.round(size);
}

export function normalizePadding(padding?: number[] | Padding): Padding {
  const candidate = padding ?? [0, 0, 0, 0];

  if (
    !Array.isArray(candidate) ||
    candidate.length !== 4 ||
    candidate.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new ValidationError("Padding must be a 4-item array of non-negative numbers");
  }

  return [
    Math.round(candidate[0]),
    Math.round(candidate[1]),
    Math.round(candidate[2]),
    Math.round(candidate[3]),
  ];
}

export function validateSquare(square: string): Square {
  const normalized = square.trim().toLowerCase();

  if (!SQUARE_PATTERN.test(normalized)) {
    throw new ValidationError(`Invalid square: ${square}`);
  }

  return normalized;
}

export function validateBoardCell(cell: BoardCell): BoardCell {
  if (cell === null || cell === "" || cell === " ") {
    return null;
  }

  if (typeof cell !== "string" || !PIECE_PATTERN.test(cell)) {
    throw new ValidationError(`Invalid board piece: ${String(cell)}`);
  }

  return cell;
}

export function validateBoardArray(board: BoardArray): BoardArray {
  if (!Array.isArray(board) || board.length !== 8) {
    throw new ValidationError("Board array must have exactly 8 ranks");
  }

  return board.map((rank, rankIndex) => {
    if (!Array.isArray(rank) || rank.length !== 8) {
      throw new ValidationError(`Board rank ${rankIndex} must contain exactly 8 files`);
    }

    return rank.map(validateBoardCell);
  });
}

export function validateStyleName(style: string): string {
  const normalized = style.trim().toLowerCase();

  if (!BUILT_IN_THEME_PATTERN.test(normalized)) {
    throw new ValidationError(`Unknown built-in style: ${style}`);
  }

  return normalized;
}

export function validateThemeName(name: string): string {
  const normalized = name.trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new ValidationError(`Invalid theme name: ${name}`);
  }

  return normalized;
}
