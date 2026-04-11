import { readFile } from "node:fs/promises";
import { createCanvas } from "canvas";
import { SQUARES } from "../core/board";
import { createBoardGeometry } from "../core/geometry";
import { RenderError } from "../types/errors";
import type { ThemeAssetSource } from "../types/types";
import { SourceAssetCache } from "./asset-cache";
import type { RenderRequest, Renderer } from "./renderer";

const svgSourceCache = new SourceAssetCache<string>();
const binarySourceCache = new SourceAssetCache<Buffer>();
const measureContext = createCanvas(1, 1).getContext("2d");

const MIN_COORDINATE_FONT_SIZE = 8;
const MAX_FILE_LABEL_WIDTH_RATIO = 0.75;
const MAX_RANK_LABEL_WIDTH_RATIO = 0.7;
const MAX_LABEL_HEIGHT_RATIO = 0.7;
const INSIDE_COORDINATE_MAX_FONT_RATIO = 0.34;
const INSIDE_LIGHT_LABEL_COLOR = "rgba(255,255,255,0.6)";
const INSIDE_DARK_LABEL_COLOR = "rgba(0,0,0,0.45)";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function isDarkSquare(square: string): boolean {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankNumber = Number(square[1]);
  return (fileIndex + rankNumber) % 2 === 1;
}

function resolveInsideLabelColor(request: RenderRequest, square: string): string {
  if (request.coordinates.color) {
    return request.coordinates.color;
  }

  return isDarkSquare(square) ? INSIDE_LIGHT_LABEL_COLOR : INSIDE_DARK_LABEL_COLOR;
}

function resolveHighlightOpacity(
  style: "fill" | "circle",
  color: string | undefined,
  opacity: number | undefined,
): number {
  if (opacity !== undefined) {
    return opacity;
  }

  if (style === "circle" || color !== undefined) {
    return 0.9;
  }

  return 1;
}

function resolveCircleLineWidth(squareSize: number, lineWidth: number | undefined): number {
  const candidate = lineWidth ?? squareSize * 0.08;
  return Math.max(2, Math.min(8, candidate));
}

function resolveCircleRadius(
  squareSize: number,
  radius: number | undefined,
  lineWidth: number,
): number {
  const radiusPx = squareSize * (radius ?? 0.42);
  return Math.max(0, radiusPx - lineWidth / 2);
}

function resolveBorderCoordinateFontSize(
  geometry: ReturnType<typeof createBoardGeometry>,
): number | null {
  const maxFontSize = Math.floor(
    Math.min(geometry.squareSize * 0.6, geometry.borderSize * 0.65),
  );

  for (let candidate = maxFontSize; candidate >= MIN_COORDINATE_FONT_SIZE; candidate -= 1) {
    measureContext.font = `${candidate}px sans-serif`;

    const filesFit = geometry.borderFileLabels.every((label) => {
      const metrics = measureContext.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.squareSize * MAX_FILE_LABEL_WIDTH_RATIO &&
        textHeight <= geometry.borderSize * MAX_LABEL_HEIGHT_RATIO
      );
    });
    const ranksFit = geometry.borderRankLabels.every((label) => {
      const metrics = measureContext.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.borderSize * MAX_RANK_LABEL_WIDTH_RATIO &&
        textHeight <= geometry.squareSize * MAX_LABEL_HEIGHT_RATIO
      );
    });

    if (filesFit && ranksFit) {
      return candidate;
    }
  }

  return null;
}

function resolveInsideCoordinateFontSize(
  geometry: ReturnType<typeof createBoardGeometry>,
): number | null {
  const maxFontSize = Math.floor(
    geometry.squareSize * INSIDE_COORDINATE_MAX_FONT_RATIO,
  );

  for (let candidate = maxFontSize; candidate >= MIN_COORDINATE_FONT_SIZE; candidate -= 1) {
    measureContext.font = `${candidate}px sans-serif`;

    const filesFit = geometry.insideFileLabels.every((label) => {
      const metrics = measureContext.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.insideLabelMaxWidth &&
        textHeight <= geometry.insideLabelMaxHeight
      );
    });
    const ranksFit = geometry.insideRankLabels.every((label) => {
      const metrics = measureContext.measureText(label.text);
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      return (
        metrics.width <= geometry.insideLabelMaxWidth &&
        textHeight <= geometry.insideLabelMaxHeight
      );
    });

    if (filesFit && ranksFit) {
      return candidate;
    }
  }

  return null;
}

function textAnchor(value: "left" | "center" | "right"): string {
  if (value === "center") {
    return "middle";
  }

  return value === "right" ? "end" : "start";
}

function dominantBaseline(value: "top" | "middle" | "bottom"): string {
  if (value === "middle") {
    return "middle";
  }

  return value === "bottom" ? "text-after-edge" : "hanging";
}

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

async function readBinarySource(filePath: string): Promise<Buffer> {
  const cached = binarySourceCache.get(filePath);

  if (cached) {
    return cached;
  }

  try {
    const source = await readFile(filePath);
    binarySourceCache.set(filePath, source);
    return source;
  } catch (error) {
    throw new RenderError(`Failed to read image asset: ${filePath}`, { cause: error });
  }
}

function stripSvgPreamble(source: string): string {
  return source
    .replace(/^\uFEFF/, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .trim();
}

function inlineSvgPiece(
  source: string,
  x: number,
  y: number,
  size: number,
): string {
  const sanitized = stripSvgPreamble(source);

  if (!sanitized.startsWith("<svg")) {
    throw new RenderError("Invalid SVG asset source");
  }

  return sanitized.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    const cleanedAttrs = attrs
      .replace(/\s(?:x|y|width|height)=(".*?"|'.*?'|[^\s>]+)/gi, "")
      .trim();
    const preservedAttrs = cleanedAttrs ? ` ${cleanedAttrs}` : "";

    return `<svg x="${x}" y="${y}" width="${size}" height="${size}"${preservedAttrs}>`;
  });
}

async function renderPieceElement(
  asset: ThemeAssetSource,
  x: number,
  y: number,
  size: number,
): Promise<string> {
  if (asset.kind === "svg") {
    const source = await readSvgSource(asset.source);
    return inlineSvgPiece(source, x, y, size);
  }

  const buffer = await readBinarySource(asset.source);
  return [
    `<image x="${x}" y="${y}" width="${size}" height="${size}"`,
    ` href="data:image/png;base64,${buffer.toString("base64")}" />`,
  ].join("");
}

async function renderPieces(
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
): Promise<string[]> {
  const pieces: string[] = [];

  for (const square of SQUARES) {
    const pieceKey = request.board.squares[square];

    if (!pieceKey) {
      continue;
    }

    const squareGeometry = geometry.squares[square];
    pieces.push(
      await renderPieceElement(
        request.theme.pieces[pieceKey],
        squareGeometry.x,
        squareGeometry.y,
        squareGeometry.size,
      ),
    );
  }

  return pieces;
}

function renderCoordinates(
  request: RenderRequest,
  geometry: ReturnType<typeof createBoardGeometry>,
): string[] {
  if (!request.coordinates.enabled) {
    return [];
  }

  if (request.coordinates.position === "border") {
    if (geometry.borderSize === 0) {
      return [];
    }

    const fontSize = resolveBorderCoordinateFontSize(geometry);

    if (fontSize === null) {
      return [];
    }

    return [
      ...geometry.borderFileLabels,
      ...geometry.borderRankLabels,
    ].map((label) =>
      `<text x="${label.x}" y="${label.y}" fill="${escapeXml(request.coordinates.color ?? "#333")}" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${escapeXml(label.text)}</text>`,
    );
  }

  const fontSize = resolveInsideCoordinateFontSize(geometry);

  if (fontSize === null) {
    return [];
  }

  return [
    ...geometry.insideFileLabels.map((label) =>
      `<text x="${label.x}" y="${label.y}" fill="${escapeXml(resolveInsideLabelColor(request, label.square))}" font-family="sans-serif" font-size="${fontSize}" text-anchor="${textAnchor(label.textAlign)}" dominant-baseline="${dominantBaseline(label.textBaseline)}">${escapeXml(label.text)}</text>`,
    ),
    ...geometry.insideRankLabels.map((label) =>
      `<text x="${label.x}" y="${label.y}" fill="${escapeXml(resolveInsideLabelColor(request, label.square))}" font-family="sans-serif" font-size="${fontSize}" text-anchor="${textAnchor(label.textAlign)}" dominant-baseline="${dominantBaseline(label.textBaseline)}">${escapeXml(label.text)}</text>`,
    ),
  ];
}

export class SvgRenderer implements Renderer<string> {
  async render(request: RenderRequest): Promise<string> {
    try {
      const geometry = createBoardGeometry({
        size: request.size,
        padding: request.padding,
        borderSize: request.borderSize,
        flipped: request.flipped,
      });

      const elements: string[] = [
        `<rect x="0" y="0" width="${geometry.imageWidth}" height="${geometry.imageHeight}" fill="${escapeXml(request.colors.lightSquare)}" />`,
      ];

      for (const square of SQUARES) {
        const squareGeometry = geometry.squares[square];
        elements.push(
          `<rect x="${squareGeometry.x}" y="${squareGeometry.y}" width="${squareGeometry.size}" height="${squareGeometry.size}" fill="${escapeXml(isDarkSquare(square) ? request.colors.darkSquare : request.colors.lightSquare)}" />`,
        );
      }

      for (const highlight of request.highlights) {
        if (highlight.style !== "fill") {
          continue;
        }

        const squareGeometry = geometry.squares[highlight.square];
        elements.push(
          `<rect x="${squareGeometry.x}" y="${squareGeometry.y}" width="${squareGeometry.size}" height="${squareGeometry.size}" fill="${escapeXml(highlight.color ?? request.colors.highlight)}" fill-opacity="${resolveHighlightOpacity(highlight.style, highlight.color, highlight.opacity)}" />`,
        );
      }

      for (const highlight of request.highlights) {
        if (highlight.style !== "circle") {
          continue;
        }

        const squareGeometry = geometry.squares[highlight.square];
        const lineWidth = resolveCircleLineWidth(squareGeometry.size, highlight.lineWidth);
        const radius = resolveCircleRadius(squareGeometry.size, highlight.radius, lineWidth);
        elements.push(
          `<circle cx="${squareGeometry.x + squareGeometry.size / 2}" cy="${squareGeometry.y + squareGeometry.size / 2}" r="${radius}" fill="none" stroke="${escapeXml(highlight.color ?? "#ffcc00")}" stroke-width="${lineWidth}" stroke-opacity="${resolveHighlightOpacity(highlight.style, highlight.color, highlight.opacity)}" />`,
        );
      }

      elements.push(...renderCoordinates(request, geometry));
      elements.push(...await renderPieces(request, geometry));

      return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${geometry.imageWidth}" height="${geometry.imageHeight}" viewBox="0 0 ${geometry.imageWidth} ${geometry.imageHeight}">`,
        ...elements,
        "</svg>",
      ].join("");
    } catch (error) {
      if (error instanceof RenderError) {
        throw error;
      }

      throw new RenderError("Failed to render chess board as SVG", { cause: error });
    }
  }
}
