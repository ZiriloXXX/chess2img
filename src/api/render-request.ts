import { parseBoardArray, parseFEN, parsePGN } from "../core/parsers";
import type { BoardPosition } from "../core/board";
import type { RenderChessOptions, RenderOptions } from "../types/types";
import { ValidationError } from "../types/errors";
import type { RenderRequest } from "../render/renderer";
import { normalizeRenderInputs } from "../utils/normalization";

export function parseInputPosition(options: RenderChessOptions): BoardPosition {
  if (typeof options.fen === "string") {
    return parseFEN(options.fen);
  }

  if (typeof options.pgn === "string") {
    return parsePGN(options.pgn);
  }

  if (Array.isArray(options.board)) {
    return parseBoardArray(options.board);
  }

  throw new ValidationError("Exactly one of fen, pgn, or board must be provided");
}

export function validateSingleInputSource(options: RenderChessOptions): void {
  const provided = [
    typeof options.fen === "string" ? options.fen : undefined,
    typeof options.pgn === "string" ? options.pgn : undefined,
    Array.isArray(options.board) ? options.board : undefined,
  ].filter((value) => value !== undefined);

  if (provided.length !== 1) {
    throw new ValidationError("Exactly one of fen, pgn, or board must be provided");
  }
}

export function createRenderRequest(
  board: BoardPosition,
  options: RenderOptions,
): RenderRequest {
  const normalized = normalizeRenderInputs(options);

  return {
    board,
    theme: normalized.theme,
    highlights: normalized.highlights,
    size: normalized.size,
    padding: normalized.padding,
    borderSize: normalized.borderSize,
    flipped: normalized.flipped,
    colors: normalized.colors,
    coordinates: normalized.coordinates,
  };
}

export function createRenderRequestFromOptions(
  options: RenderChessOptions,
): RenderRequest {
  validateSingleInputSource(options);
  const board = parseInputPosition(options);
  return createRenderRequest(board, options);
}
