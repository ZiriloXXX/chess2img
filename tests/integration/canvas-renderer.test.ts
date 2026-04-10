import { createCanvas, loadImage } from "canvas";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderChess } from "../../src";
import { createBoardGeometry } from "../../src/core/geometry";
import { parseFEN } from "../../src/core/parsers";
import { CanvasPngRenderer } from "../../src/render/canvas-renderer";
import { resolveTheme } from "../../src/themes/resolver";
import type { ThemeDefinition } from "../../src/types/types";

async function getPixel(buffer: Buffer, x: number, y: number) {
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(Math.round(x), Math.round(y), 1, 1);
  return Array.from(data);
}

describe("CanvasPngRenderer", () => {
  it("renders a PNG buffer", async () => {
    const renderer = new CanvasPngRenderer();
    const buffer = await renderer.render({
      board: parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1"),
      theme: resolveTheme({ style: "merida" }),
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: false,
      coordinates: {
        enabled: false,
        color: "#333",
      },
      colors: {
        lightSquare: "#f0d9b5",
        darkSquare: "#b58863",
        highlight: "#ffcc0080",
      },
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("renders PNG-backed theme assets", async () => {
    const renderer = new CanvasPngRenderer();
    const pieceAsset = resolve(process.cwd(), "tests/fixtures/golden/fen-simple-kings-merida.png");
    const rasterTheme = {
      name: "png-theme",
      displayName: "PNG Theme",
      license: "Derived",
      attribution: "Raster fixture",
      pieces: {
        wK: { kind: "png", source: pieceAsset },
        wQ: { kind: "png", source: pieceAsset },
        wR: { kind: "png", source: pieceAsset },
        wB: { kind: "png", source: pieceAsset },
        wN: { kind: "png", source: pieceAsset },
        wP: { kind: "png", source: pieceAsset },
        bK: { kind: "png", source: pieceAsset },
        bQ: { kind: "png", source: pieceAsset },
        bR: { kind: "png", source: pieceAsset },
        bB: { kind: "png", source: pieceAsset },
        bN: { kind: "png", source: pieceAsset },
        bP: { kind: "png", source: pieceAsset },
      },
    } as unknown as ThemeDefinition;

    const buffer = await renderer.render({
      board: parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1"),
      theme: rasterTheme,
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: false,
      coordinates: {
        enabled: false,
        color: "#333",
      },
      colors: {
        lightSquare: "#f0d9b5",
        darkSquare: "#b58863",
        highlight: "#ffcc0080",
      },
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("renders coordinate labels when enabled", async () => {
    const renderer = new CanvasPngRenderer();
    const request = {
      board: parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1"),
      theme: resolveTheme({ style: "cburnett" }),
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0] as [number, number, number, number],
      borderSize: 24,
      flipped: false,
      colors: {
        lightSquare: "#f0d9b5",
        darkSquare: "#b58863",
        highlight: "#ffcc0080",
      },
    };

    const disabled = await renderer.render({
      ...request,
      coordinates: {
        enabled: false,
        color: "#333",
      },
    });
    const enabled = await renderer.render({
      ...request,
      coordinates: {
        enabled: true,
        color: "#333",
      },
    });

    expect(enabled.equals(disabled)).toBe(false);
  });

  it("does not render coordinate labels when disabled", async () => {
    const omitted = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: false,
    });

    expect(disabled.equals(omitted)).toBe(true);
  });

  it("suppresses coordinates when a small valid render cannot fit them legibly", async () => {
    const enabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 128,
      style: "cburnett",
      borderSize: 16,
      coordinates: true,
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 128,
      style: "cburnett",
      borderSize: 16,
      coordinates: false,
    });

    expect(enabled.equals(disabled)).toBe(true);
  });

  it("keeps piece placement aligned with the inner board geometry when a border is used", async () => {
    const renderer = new CanvasPngRenderer();
    const buffer = await renderer.render({
      board: parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1"),
      theme: resolveTheme({ style: "merida" }),
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 24,
      flipped: false,
      coordinates: {
        enabled: false,
        color: "#333",
      },
      colors: {
        lightSquare: "#f0d9b5",
        darkSquare: "#b58863",
        highlight: "#ffcc0080",
      },
    });
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 24,
      flipped: false,
    });
    const square = geometry.squares.e1;
    const pixel = await getPixel(
      buffer,
      square.x + square.size / 2,
      square.y + square.size / 2,
    );

    expect(pixel).not.toEqual([240, 217, 181, 255]);
  });
});
