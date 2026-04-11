import { validateHighlightsInput } from "../core/validators";
import { ValidationError } from "../types/errors";
import type {
  BoardArray,
  ChessImageGeneratorOptions,
  HighlightInput,
  RenderOptions,
} from "../types/types";
import { CanvasPngRenderer } from "../render/canvas-renderer";
import { CanvasJpegRenderer } from "../render/canvas-jpeg-renderer";
import { SvgRenderer } from "../render/svg-renderer";
import { writeBufferToFile, writeStringToFile } from "../utils/io";
import { normalizeRenderInputs } from "../utils/normalization";
import type { BoardPosition } from "../core/board";
import { createRenderRequest } from "./render-request";
import { parseBoardArray, parseFEN, parsePGN } from "../core/parsers";

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
    const request = createRenderRequest(this.position, {
      ...this.defaults,
      highlights: this.highlights,
      highlightSquares: undefined,
    });

    return renderer.render(request);
  }

  async toFile(filePath: string): Promise<void> {
    const buffer = await this.toBuffer();
    await writeBufferToFile(filePath, buffer);
  }

  async toSvg(): Promise<string> {
    if (!this.position) {
      throw new ValidationError("No board position loaded");
    }

    const renderer = new SvgRenderer();
    const request = createRenderRequest(this.position, {
      ...this.defaults,
      highlights: this.highlights,
      highlightSquares: undefined,
    });

    return renderer.render(request);
  }

  async toSvgFile(filePath: string): Promise<void> {
    await writeStringToFile(filePath, await this.toSvg());
  }

  async toJpeg(): Promise<Buffer> {
    if (!this.position) {
      throw new ValidationError("No board position loaded");
    }

    const renderer = new CanvasJpegRenderer();
    const request = createRenderRequest(this.position, {
      ...this.defaults,
      highlights: this.highlights,
      highlightSquares: undefined,
    });

    return renderer.render(request);
  }

  async toJpegFile(filePath: string): Promise<void> {
    await writeBufferToFile(filePath, await this.toJpeg());
  }
}
