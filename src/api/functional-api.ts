import type { RenderChessOptions } from "../types/types";
import { CanvasPngRenderer } from "../render/canvas-renderer";
import { CanvasJpegRenderer } from "../render/canvas-jpeg-renderer";
import { SvgRenderer } from "../render/svg-renderer";
import { writeBufferToFile, writeStringToFile } from "../utils/io";
import { createRenderRequestFromOptions } from "./render-request";

export async function renderChess(options: RenderChessOptions): Promise<Buffer> {
  const renderer = new CanvasPngRenderer();
  return renderer.render(createRenderRequestFromOptions(options));
}

export async function renderSvg(options: RenderChessOptions): Promise<string> {
  const renderer = new SvgRenderer();
  return renderer.render(createRenderRequestFromOptions(options));
}

export async function renderJpeg(options: RenderChessOptions): Promise<Buffer> {
  const renderer = new CanvasJpegRenderer();
  return renderer.render(createRenderRequestFromOptions(options));
}

export async function renderFile(
  filePath: string,
  options: RenderChessOptions,
): Promise<void> {
  await writeBufferToFile(filePath, await renderChess(options));
}

export async function renderSvgFile(
  filePath: string,
  options: RenderChessOptions,
): Promise<void> {
  await writeStringToFile(filePath, await renderSvg(options));
}

export async function renderJpegFile(
  filePath: string,
  options: RenderChessOptions,
): Promise<void> {
  await writeBufferToFile(filePath, await renderJpeg(options));
}
