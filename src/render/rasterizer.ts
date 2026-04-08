import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "canvas";
import { Resvg } from "@resvg/resvg-js";
import { RenderError } from "../types/errors";
import type { ThemeAssetSource } from "../types/types";
import { SourceAssetCache } from "./asset-cache";

const svgSourceCache = new SourceAssetCache<string>();
const imageBufferCache = new SourceAssetCache<Buffer>();

async function readSvgSource(filePath: string): Promise<string> {
  const cached = svgSourceCache.get(filePath);

  if (cached) {
    return cached;
  }

  try {
    const source = await readFile(filePath, "utf8");
    svgSourceCache.set(filePath, source);
    return source;
  } catch (error) {
    throw new RenderError(`Failed to read SVG asset: ${filePath}`, { cause: error });
  }
}

async function readBinaryAsset(filePath: string): Promise<Buffer> {
  const cached = imageBufferCache.get(filePath);

  if (cached) {
    return cached;
  }

  try {
    const source = await readFile(filePath);
    imageBufferCache.set(filePath, source);
    return source;
  } catch (error) {
    throw new RenderError(`Failed to read image asset: ${filePath}`, { cause: error });
  }
}

async function rasterizeSvgAsset(filePath: string, squareSize: number) {
  try {
    const svgSource = await readSvgSource(filePath);
    const resvg = new Resvg(svgSource, {
      fitTo: {
        mode: "width",
        value: squareSize,
      },
    });
    const pngBuffer = resvg.render().asPng();
    const image = await loadImage(pngBuffer);
    const canvas = createCanvas(squareSize, squareSize);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, squareSize, squareSize);
    return canvas;
  } catch (error) {
    throw new RenderError(`Failed to rasterize SVG asset: ${filePath}`, { cause: error });
  }
}

async function rasterizePngAsset(filePath: string, squareSize: number) {
  try {
    const pngSource = await readBinaryAsset(filePath);
    const image = await loadImage(pngSource);
    const canvas = createCanvas(squareSize, squareSize);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, squareSize, squareSize);
    return canvas;
  } catch (error) {
    throw new RenderError(`Failed to rasterize PNG asset: ${filePath}`, { cause: error });
  }
}

export async function rasterizeThemeAsset(asset: ThemeAssetSource, squareSize: number) {
  if (asset.kind === "svg") {
    return rasterizeSvgAsset(asset.source, squareSize);
  }

  return rasterizePngAsset(asset.source, squareSize);
}
