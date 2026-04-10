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

function drawCoordinates(
  context: ReturnType<typeof createCanvas>["getContext"],
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
) {
  if (!request.coordinates.enabled || geometry.borderSize === 0) {
    return;
  }

  const maxFontSize = Math.floor(
    Math.min(geometry.squareSize * 0.6, geometry.borderSize * 0.65),
  );
  let fontSize: number | null = null;

  for (let candidate = maxFontSize; candidate >= MIN_COORDINATE_FONT_SIZE; candidate -= 1) {
    context.font = `${candidate}px sans-serif`;

    const filesFit = geometry.fileLabels.every((label) => {
      const metrics = context.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.squareSize * MAX_FILE_LABEL_WIDTH_RATIO &&
        textHeight <= geometry.borderSize * MAX_LABEL_HEIGHT_RATIO
      );
    });
    const ranksFit = geometry.rankLabels.every((label) => {
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

  if (fontSize === null) {
    return;
  }

  context.fillStyle = request.coordinates.color;
  context.font = `${fontSize}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (const label of geometry.fileLabels) {
    context.fillText(label.text, label.x, label.y);
  }

  for (const label of geometry.rankLabels) {
    context.fillText(label.text, label.x, label.y);
  }
}

export class CanvasPngRenderer implements Renderer<Buffer> {
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

        if (request.highlights.includes(square)) {
          context.fillStyle = request.colors.highlight;
          context.fillRect(
            squareGeometry.x,
            squareGeometry.y,
            squareGeometry.size,
            squareGeometry.size,
          );
        }

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

      drawCoordinates(context, request, geometry);

      return canvas.toBuffer("image/png");
    } catch (error) {
      if (error instanceof RenderError) {
        throw error;
      }

      throw new RenderError("Failed to render chess board", { cause: error });
    }
  }
}
