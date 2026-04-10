import { createCanvas } from "canvas";
import type {
  BoardArray,
  BoardCell,
  BoardColors,
  CoordinatesInput,
  CoordinatesOptions,
  CoordinatesPosition,
  HighlightInput,
  HighlightOptions,
  HighlightStyle,
  Padding,
  Square,
} from "../types/types";
import { ValidationError } from "../types/errors";

const SQUARE_PATTERN = /^[a-h][1-8]$/;
const PIECE_PATTERN = /^[prnbqkPRNBQK]$/;
const BUILT_IN_THEME_PATTERN = /^(merida|alpha|cburnett|cheq|leipzig)$/;
const colorValidationContext = createCanvas(1, 1).getContext("2d");

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

export function validateBorderSize(borderSize: number, size: number): number {
  const normalizedSize = validateSize(size);
  const normalizedBorderSize = Math.round(borderSize);
  const maxBorderSize = Math.floor(normalizedSize / 8);

  if (!Number.isFinite(borderSize) || normalizedBorderSize < 0) {
    throw new ValidationError(`Invalid borderSize: ${borderSize}`);
  }

  if (normalizedBorderSize > maxBorderSize) {
    throw new ValidationError(
      `Invalid borderSize: ${borderSize}. Maximum allowed for size ${normalizedSize} is ${maxBorderSize}`,
    );
  }

  return normalizedBorderSize;
}

export function validateColorString(color: string, label = "color"): string {
  if (typeof color !== "string" || color.trim() === "") {
    throw new ValidationError(`Invalid ${label}: ${String(color)}`);
  }

  const normalized = color.trim();
  colorValidationContext.fillStyle = "#010203";
  colorValidationContext.fillStyle = normalized;
  const firstPass = String(colorValidationContext.fillStyle);
  colorValidationContext.fillStyle = "#fefefe";
  colorValidationContext.fillStyle = normalized;
  const secondPass = String(colorValidationContext.fillStyle);

  if (firstPass !== secondPass) {
    throw new ValidationError(`Invalid ${label}: ${color}`);
  }

  return normalized;
}

export function validateBoardColors(colors?: BoardColors): void {
  if (!colors) {
    return;
  }

  if (colors.lightSquare !== undefined) {
    validateColorString(colors.lightSquare, "lightSquare color");
  }

  if (colors.darkSquare !== undefined) {
    validateColorString(colors.darkSquare, "darkSquare color");
  }

  if (colors.highlight !== undefined) {
    validateColorString(colors.highlight, "highlight color");
  }
}

function isCoordinatesOptions(value: unknown): value is CoordinatesOptions {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCoordinatesPosition(value: unknown): value is CoordinatesPosition {
  return value === "border" || value === "inside";
}

function isHighlightOptions(value: unknown): value is HighlightOptions {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHighlightStyle(value: unknown): value is HighlightStyle {
  return value === "fill" || value === "circle";
}

export function validateCoordinatesOption(
  coordinates: CoordinatesInput | undefined,
  borderSize: number,
): void {
  if (coordinates === undefined || typeof coordinates === "boolean") {
    return;
  }

  if (isCoordinatesPosition(coordinates)) {
    if (coordinates === "border" && borderSize === 0) {
      throw new ValidationError(
        "coordinates position 'border' requires borderSize > 0",
      );
    }

    return;
  }

  if (!isCoordinatesOptions(coordinates)) {
    throw new ValidationError(
      "coordinates must be false, true, 'border', 'inside', or an options object",
    );
  }

  if (
    coordinates.enabled !== undefined &&
    typeof coordinates.enabled !== "boolean"
  ) {
    throw new ValidationError("coordinates.enabled must be a boolean");
  }

  if (
    coordinates.position !== undefined &&
    !isCoordinatesPosition(coordinates.position)
  ) {
    throw new ValidationError("coordinates.position must be 'border' or 'inside'");
  }

  if (
    coordinates.enabled !== false &&
    coordinates.position === "border" &&
    borderSize === 0
  ) {
    throw new ValidationError(
      "coordinates position 'border' requires borderSize > 0",
    );
  }

  if (coordinates.color !== undefined) {
    validateColorString(coordinates.color, "coordinates.color");
  }
}

function validateHighlightEntry(entry: HighlightInput): void {
  if (typeof entry === "string") {
    validateSquare(entry);
    return;
  }

  if (!isHighlightOptions(entry)) {
    throw new ValidationError("highlights entries must be square strings or highlight objects");
  }

  if (typeof entry.square !== "string") {
    throw new ValidationError("highlight.square must be a valid algebraic square");
  }

  validateSquare(entry.square);

  if (entry.style !== undefined && !isHighlightStyle(entry.style)) {
    throw new ValidationError("highlight.style must be 'fill' or 'circle'");
  }

  if (entry.color !== undefined) {
    validateColorString(entry.color, "highlight.color");
  }

  if (
    entry.opacity !== undefined &&
    (!Number.isFinite(entry.opacity) || entry.opacity < 0 || entry.opacity > 1)
  ) {
    throw new ValidationError("highlight.opacity must be a finite number between 0 and 1");
  }

  if (
    entry.lineWidth !== undefined &&
    (!Number.isFinite(entry.lineWidth) || entry.lineWidth <= 0)
  ) {
    throw new ValidationError("highlight.lineWidth must be a finite number greater than 0");
  }
}

export function validateHighlightOptions(highlights: HighlightInput[] | undefined): void {
  if (highlights === undefined) {
    return;
  }

  if (!Array.isArray(highlights)) {
    throw new ValidationError("highlights must be an array");
  }

  for (const entry of highlights) {
    validateHighlightEntry(entry);
  }
}

export function validateHighlightsInput(
  highlights: HighlightInput[] | undefined,
  highlightSquares: HighlightInput[] | undefined,
): void {
  if (highlights !== undefined && highlightSquares !== undefined) {
    throw new ValidationError("Use either highlights or highlightSquares, not both");
  }

  validateHighlightOptions(highlights);
  validateHighlightOptions(highlightSquares);
}
