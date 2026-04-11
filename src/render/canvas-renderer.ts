import { createCanvas } from "canvas";
import { SQUARES } from "../core/board";
import { createBoardGeometry } from "../core/geometry";
import { RenderError } from "../types/errors";
import type { ThemeAssetSource } from "../types/types";
import { createRasterCacheKey, RasterAssetCache } from "./asset-cache";
import type { RenderRequest, Renderer } from "./renderer";
import { rasterizeThemeAsset } from "./rasterizer";

const pieceRasterCache = new RasterAssetCache<Awaited<ReturnType<typeof rasterizeThemeAsset>>>();
const MIN_COORDINATE_FONT_SIZE = 8;
const MAX_FILE_LABEL_WIDTH_RATIO = 0.75;
const MAX_RANK_LABEL_WIDTH_RATIO = 0.7;
const MAX_LABEL_HEIGHT_RATIO = 0.7;
const INSIDE_COORDINATE_MAX_FONT_RATIO = 0.34;
const INSIDE_LIGHT_LABEL_COLOR = "rgba(255,255,255,0.6)";
const INSIDE_DARK_LABEL_COLOR = "rgba(0,0,0,0.45)";

function isDarkSquare(square: string): boolean {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankNumber = Number(square[1]);
  return (fileIndex + rankNumber) % 2 === 1;
}

async function getPieceRaster(
  themeName: string,
  pieceKey: string,
  asset: ThemeAssetSource,
  squareSize: number,
) {
  const cacheKey = createRasterCacheKey(themeName, pieceKey, squareSize, "png-canvas");
  const cached = pieceRasterCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const raster = await rasterizeThemeAsset(asset, squareSize);
  pieceRasterCache.set(cacheKey, raster);
  return raster;
}

function resolveInsideLabelColor(
  request: RenderRequest,
  square: string,
) {
  if (request.coordinates.color) {
    return request.coordinates.color;
  }

  return isDarkSquare(square) ? INSIDE_LIGHT_LABEL_COLOR : INSIDE_DARK_LABEL_COLOR;
}

function resolveHighlightOpacity(style: "fill" | "circle", color: string | undefined, opacity: number | undefined) {
  if (opacity !== undefined) {
    return opacity;
  }

  if (style === "circle" || color !== undefined) {
    return 0.9;
  }

  // Preserve legacy fill behavior when the board highlight color is used directly.
  return 1;
}

function resolveCircleLineWidth(squareSize: number, lineWidth: number | undefined) {
  const candidate = lineWidth ?? squareSize * 0.08;
  return Math.max(2, Math.min(8, candidate));
}

function resolveCircleRadius(
  squareSize: number,
  radius: number | undefined,
  lineWidth: number,
) {
  const radiusPx = squareSize * (radius ?? 0.42);
  return Math.max(0, radiusPx - lineWidth / 2);
}

function resolveBorderCoordinateFontSize(
  context: ReturnType<typeof createCanvas>["getContext"],
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  const maxFontSize = Math.floor(
    Math.min(geometry.squareSize * 0.6, geometry.borderSize * 0.65),
  );
  let fontSize: number | null = null;

  for (let candidate = maxFontSize; candidate >= MIN_COORDINATE_FONT_SIZE; candidate -= 1) {
    context.font = `${candidate}px sans-serif`;

    const filesFit = geometry.borderFileLabels.every((label) => {
      const metrics = context.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.squareSize * MAX_FILE_LABEL_WIDTH_RATIO &&
        textHeight <= geometry.borderSize * MAX_LABEL_HEIGHT_RATIO
      );
    });
    const ranksFit = geometry.borderRankLabels.every((label) => {
      const metrics = context.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.borderSize * MAX_RANK_LABEL_WIDTH_RATIO &&
        textHeight <= geometry.squareSize * MAX_LABEL_HEIGHT_RATIO
      );
    });

    if (filesFit && ranksFit) {
      fontSize = candidate;
      break;
    }
  }

  return fontSize;
}

function resolveInsideCoordinateFontSize(
  context: ReturnType<typeof createCanvas>["getContext"],
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  const maxFontSize = Math.floor(
    geometry.squareSize * INSIDE_COORDINATE_MAX_FONT_RATIO,
  );
  let fontSize: number | null = null;

  for (let candidate = maxFontSize; candidate >= MIN_COORDINATE_FONT_SIZE; candidate -= 1) {
    context.font = `${candidate}px sans-serif`;

    const filesFit = geometry.insideFileLabels.every((label) => {
      const metrics = context.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.insideLabelMaxWidth &&
        textHeight <= geometry.insideLabelMaxHeight
      );
    });
    const ranksFit = geometry.insideRankLabels.every((label) => {
      const metrics = context.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.insideLabelMaxWidth &&
        textHeight <= geometry.insideLabelMaxHeight
      );
    });

    if (filesFit && ranksFit) {
      fontSize = candidate;
      break;
    }
  }

  return fontSize;
}

function drawBorderCoordinates(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  if (geometry.borderSize === 0) {
    return;
  }

  const fontSize = resolveBorderCoordinateFontSize(context, geometry);

  if (fontSize === null) {
    return;
  }

  context.fillStyle = request.coordinates.color ?? "#333";
  context.font = `${fontSize}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (const label of geometry.borderFileLabels) {
    context.fillText(label.text, label.x, label.y);
  }

  for (const label of geometry.borderRankLabels) {
    context.fillText(label.text, label.x, label.y);
  }
}

function drawInsideCoordinates(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  const fontSize = resolveInsideCoordinateFontSize(context, geometry);

  if (fontSize === null) {
    return;
  }

  context.font = `${fontSize}px sans-serif`;

  for (const label of geometry.insideFileLabels) {
    context.fillStyle = resolveInsideLabelColor(request, label.square);
    context.textAlign = label.textAlign;
    context.textBaseline = label.textBaseline;
    context.fillText(label.text, label.x, label.y);
  }

  for (const label of geometry.insideRankLabels) {
    context.fillStyle = resolveInsideLabelColor(request, label.square);
    context.textAlign = label.textAlign;
    context.textBaseline = label.textBaseline;
    context.fillText(label.text, label.x, label.y);
  }
}

function drawCoordinates(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  if (!request.coordinates.enabled) {
    return;
  }

  if (request.coordinates.position === "border") {
    drawBorderCoordinates(context, request, geometry);
    return;
  }

  drawInsideCoordinates(context, request, geometry);
}

function drawBoardSquares(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  for (const square of SQUARES) {
    const squareGeometry = geometry.squares[square];
    context.fillStyle = isDarkSquare(square)
      ? request.colors.darkSquare
      : request.colors.lightSquare;
    context.fillRect(
      squareGeometry.x,
      squareGeometry.y,
      squareGeometry.size,
      squareGeometry.size,
    );
  }
}

function drawFillHighlights(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  for (const highlight of request.highlights) {
    if (highlight.style !== "fill") {
      continue;
    }

    const squareGeometry = geometry.squares[highlight.square];
    context.save();
    context.globalAlpha = resolveHighlightOpacity(
      highlight.style,
      highlight.color,
      highlight.opacity,
    );
    context.fillStyle = highlight.color ?? request.colors.highlight;
    context.fillRect(
      squareGeometry.x,
      squareGeometry.y,
      squareGeometry.size,
      squareGeometry.size,
    );
    context.restore();
  }
}

function drawCircleHighlights(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  for (const highlight of request.highlights) {
    if (highlight.style !== "circle") {
      continue;
    }

    const squareGeometry = geometry.squares[highlight.square];
    const centerX = squareGeometry.x + squareGeometry.size / 2;
    const centerY = squareGeometry.y + squareGeometry.size / 2;
    context.save();
    context.globalAlpha = resolveHighlightOpacity(
      highlight.style,
      highlight.color,
      highlight.opacity,
    );
    context.strokeStyle = highlight.color ?? "#ffcc00";
    context.lineWidth = resolveCircleLineWidth(
      squareGeometry.size,
      highlight.lineWidth,
    );
    const radius = resolveCircleRadius(
      squareGeometry.size,
      highlight.radius,
      context.lineWidth,
    );
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2,
    );
    context.stroke();
    context.restore();
  }
}

async function drawPieces(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  for (const square of SQUARES) {
    const squareGeometry = geometry.squares[square];
    const pieceKey = request.board.squares[square];
    if (!pieceKey) {
      continue;
    }

    const raster = await getPieceRaster(
      request.theme.name,
      pieceKey,
      request.theme.pieces[pieceKey],
      Math.round(geometry.squareSize),
    );
    context.drawImage(
      raster,
      squareGeometry.x,
      squareGeometry.y,
      squareGeometry.size,
      squareGeometry.size,
    );
  }
}

export class CanvasPngRenderer implements Renderer<Buffer> {
  protected createOutputBuffer(
    canvas: ReturnType<typeof createCanvas>,
  ): Buffer {
    return canvas.toBuffer("image/png");
  }

  async render(request: RenderRequest): Promise<Buffer> {
    try {
      const geometry = createBoardGeometry({
        size: request.size,
        padding: request.padding,
        borderSize: request.borderSize,
        flipped: request.flipped,
      });

      const canvas = createCanvas(geometry.imageWidth, geometry.imageHeight);
      const context = canvas.getContext("2d");

      context.fillStyle = request.colors.lightSquare;
      context.fillRect(0, 0, geometry.imageWidth, geometry.imageHeight);
      drawBoardSquares(context, request, geometry);
      drawFillHighlights(context, request, geometry);
      drawCircleHighlights(context, request, geometry);
      drawCoordinates(context, request, geometry);
      await drawPieces(context, request, geometry);

      return this.createOutputBuffer(canvas);
    } catch (error) {
      if (error instanceof RenderError) {
        throw error;
      }

      throw new RenderError("Failed to render chess board", { cause: error });
    }
  }
}
