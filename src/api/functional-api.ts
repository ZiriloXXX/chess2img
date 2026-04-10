import { parseBoardArray, parseFEN, parsePGN } from "../core/parsers";
import { ValidationError } from "../types/errors";
import type { RenderChessOptions } from "../types/types";
import { CanvasPngRenderer } from "../render/canvas-renderer";
import { normalizeRenderInputs } from "../utils/normalization";

function parseInputPosition(options: RenderChessOptions) {
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

export async function renderChess(options: RenderChessOptions): Promise<Buffer> {
  const provided = [
    typeof options.fen === "string" ? options.fen : undefined,
    typeof options.pgn === "string" ? options.pgn : undefined,
    Array.isArray(options.board) ? options.board : undefined,
  ].filter((value) => value !== undefined);

  if (provided.length !== 1) {
    throw new ValidationError("Exactly one of fen, pgn, or board must be provided");
  }

  const position = parseInputPosition(options);
  const renderer = new CanvasPngRenderer();
  const normalized = normalizeRenderInputs(options);

  return renderer.render({
    board: position,
    theme: normalized.theme,
    highlights: normalized.highlightSquares,
    size: normalized.size,
    padding: normalized.padding,
    borderSize: normalized.borderSize,
    flipped: normalized.flipped,
    colors: normalized.colors,
    coordinates: normalized.coordinates,
  });
}
