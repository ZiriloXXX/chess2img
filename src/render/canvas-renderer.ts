import { createCanvas } from "canvas";
import { SQUARES } from "../core/board";
import { createBoardGeometry } from "../core/geometry";
import { RenderError } from "../types/errors";
import { createRasterCacheKey, RasterAssetCache } from "./asset-cache";
import type { RenderRequest, Renderer } from "./renderer";
import { rasterizeSvgAsset } from "./rasterizer";

const pieceRasterCache = new RasterAssetCache<Awaited<ReturnType<typeof rasterizeSvgAsset>>>();

function isDarkSquare(square: string): boolean {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankNumber = Number(square[1]);
  return (fileIndex + rankNumber) % 2 === 1;
}

async function getPieceRaster(themeName: string, pieceKey: string, assetPath: string, squareSize: number) {
  const cacheKey = createRasterCacheKey(themeName, pieceKey, squareSize, "png-canvas");
  const cached = pieceRasterCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const raster = await rasterizeSvgAsset(assetPath, squareSize);
  pieceRasterCache.set(cacheKey, raster);
  return raster;
}

export class CanvasPngRenderer implements Renderer<Buffer> {
  async render(request: RenderRequest): Promise<Buffer> {
    try {
      const geometry = createBoardGeometry({
        size: request.size,
        padding: request.padding,
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

        const assetPath = request.theme.pieces[pieceKey].source;
        const raster = await getPieceRaster(
          request.theme.name,
          pieceKey,
          assetPath,
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

      return canvas.toBuffer("image/png");
    } catch (error) {
      if (error instanceof RenderError) {
        throw error;
      }

      throw new RenderError("Failed to render chess board", { cause: error });
    }
  }
}
