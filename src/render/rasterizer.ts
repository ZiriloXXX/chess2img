import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "canvas";
import { Resvg } from "@resvg/resvg-js";
import { RenderError } from "../types/errors";
import { SourceAssetCache } from "./asset-cache";

const svgSourceCache = new SourceAssetCache<string>();

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

export async function rasterizeSvgAsset(filePath: string, squareSize: number) {
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
