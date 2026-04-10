import { parseBoardArray, parseFEN, parsePGN } from "../core/parsers";
import { validateHighlightsInput } from "../core/validators";
import { ValidationError } from "../types/errors";
import type {
  BoardArray,
  ChessImageGeneratorOptions,
  HighlightInput,
  RenderOptions,
} from "../types/types";
import { CanvasPngRenderer } from "../render/canvas-renderer";
import { writeBufferToFile } from "../utils/io";
import { normalizeRenderInputs } from "../utils/normalization";
import type { BoardPosition } from "../core/board";

export class ChessImageGenerator {
  private position: BoardPosition | null = null;

  private readonly defaults: RenderOptions;

  private highlights: HighlightInput[] = [];

  constructor(options: ChessImageGeneratorOptions = {}) {
    this.defaults = { ...options };
    normalizeRenderInputs(this.defaults);
  }

  async loadFEN(fen: string): Promise<void> {
    this.position = parseFEN(fen);
    this.clearHighlights();
  }

  async loadPGN(pgn: string): Promise<void> {
    this.position = parsePGN(pgn);
    this.clearHighlights();
  }

  async loadBoard(board: BoardArray): Promise<void> {
    this.position = parseBoardArray(board);
    this.clearHighlights();
  }

  setHighlights(highlights: HighlightInput[]): void {
    validateHighlightsInput(highlights, undefined);
    this.highlights = [...highlights];
  }

  clearHighlights(): void {
    this.highlights = [];
  }

  async toBuffer(): Promise<Buffer> {
    if (!this.position) {
      throw new ValidationError("No board position loaded");
    }

    const renderer = new CanvasPngRenderer();
    const normalized = normalizeRenderInputs({
      ...this.defaults,
      highlights: this.highlights,
      highlightSquares: undefined,
    });

    return renderer.render({
      board: this.position,
      theme: normalized.theme,
      highlights: normalized.highlights,
      size: normalized.size,
      padding: normalized.padding,
      borderSize: normalized.borderSize,
      flipped: normalized.flipped,
      colors: normalized.colors,
      coordinates: normalized.coordinates,
    });
  }

  async toFile(filePath: string): Promise<void> {
    const buffer = await this.toBuffer();
    await writeBufferToFile(filePath, buffer);
  }
}
