import { createCanvas, loadImage } from "canvas";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderChess } from "../../src";
import { createBoardGeometry } from "../../src/core/geometry";
import { parseFEN } from "../../src/core/parsers";
import { CanvasPngRenderer } from "../../src/render/canvas-renderer";
import { resolveTheme } from "../../src/themes/resolver";
import { ValidationError } from "../../src/types/errors";
import type { ThemeDefinition } from "../../src/types/types";

async function getPixel(buffer: Buffer, x: number, y: number) {
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(Math.round(x), Math.round(y), 1, 1);
  return Array.from(data);
}

async function countDifferingPixels(
  leftBuffer: Buffer,
  rightBuffer: Buffer,
  area: { x: number; y: number; width: number; height: number },
) {
  const leftImage = await loadImage(leftBuffer);
  const rightImage = await loadImage(rightBuffer);
  const leftCanvas = createCanvas(leftImage.width, leftImage.height);
  const rightCanvas = createCanvas(rightImage.width, rightImage.height);
  const leftContext = leftCanvas.getContext("2d");
  const rightContext = rightCanvas.getContext("2d");
  leftContext.drawImage(leftImage, 0, 0);
  rightContext.drawImage(rightImage, 0, 0);
  const leftData = leftContext.getImageData(area.x, area.y, area.width, area.height).data;
  const rightData = rightContext.getImageData(area.x, area.y, area.width, area.height).data;
  let count = 0;

  for (let index = 0; index < leftData.length; index += 4) {
    if (
      leftData[index] !== rightData[index] ||
      leftData[index + 1] !== rightData[index + 1] ||
      leftData[index + 2] !== rightData[index + 2] ||
      leftData[index + 3] !== rightData[index + 3]
    ) {
      count += 1;
    }
  }

  return count;
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
        position: "inside",
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
        position: "inside",
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
        position: "inside",
        color: "#333",
      },
    });
    const enabled = await renderer.render({
      ...request,
      coordinates: {
        enabled: true,
        position: "border",
        color: "#333",
      },
    });

    expect(enabled.equals(disabled)).toBe(false);
  });

  it("renders automatic coordinates with a border band when borderSize is set", async () => {
    const automatic = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: true,
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: false,
    });
    const explicitInside = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: "inside",
    });

    expect(automatic.equals(disabled)).toBe(false);
    expect(
      await countDifferingPixels(
        automatic,
        explicitInside,
        { x: 0, y: 376, width: 400, height: 24 },
      ),
    ).toBeGreaterThan(10);
  });

  it("renders automatic coordinates inside the edge squares when no border exists", async () => {
    const automatic = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: true,
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: false,
    });

    expect(automatic.equals(disabled)).toBe(false);
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

  it("renders canonical fill highlights from the new highlights API", async () => {
    const filled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: ["e4"],
    });
    const legacy = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlightSquares: ["e4"],
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [],
    });

    expect(filled.equals(legacy)).toBe(true);
    expect(filled.equals(disabled)).toBe(false);
  });

  it("renders circle highlights", async () => {
    const circled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle" }],
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [],
    });

    expect(circled.equals(disabled)).toBe(false);
  });

  it("renders fill and circle highlights together on the same square", async () => {
    const combined = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: ["e4", { square: "e4", style: "circle" }],
    });
    const fillOnly = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: ["e4"],
    });

    expect(combined.equals(fillOnly)).toBe(false);
  });

  it("applies opacity differences to highlight rendering", async () => {
    const faint = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", opacity: 0.2 }],
    });
    const strong = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", opacity: 1 }],
    });

    expect(faint.equals(strong)).toBe(false);
  });

  it("applies line width differences to circle highlight rendering", async () => {
    const thin = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle", lineWidth: 2 }],
    });
    const thick = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle", lineWidth: 8 }],
    });

    expect(thin.equals(thick)).toBe(false);
  });

  it("applies radius differences to circle highlight rendering", async () => {
    const small = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle", radius: 0.3 }],
    });
    const large = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle", radius: 0.5 }],
    });

    expect(small.equals(large)).toBe(false);
  });

  it("rejects invalid circle highlight line widths", async () => {
    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        size: 400,
        style: "cburnett",
        highlights: [{ square: "e4", style: "circle", lineWidth: 0 }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects invalid circle highlight radii", async () => {
    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        size: 400,
        style: "cburnett",
        highlights: [{ square: "e4", style: "circle", radius: 0 }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        size: 400,
        style: "cburnett",
        highlights: [{ square: "e4", style: "circle", radius: 0.6 }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("renders explicit inside coordinates without requiring a border", async () => {
    const inside = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: "inside",
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: false,
    });

    expect(inside.equals(disabled)).toBe(false);
  });

  it("renders explicit border coordinates when a border exists", async () => {
    const border = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: "border",
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: false,
    });

    expect(border.equals(disabled)).toBe(false);
  });

  it("rejects explicit border coordinates without a border", async () => {
    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        size: 400,
        style: "cburnett",
        coordinates: "border",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("renders flipped inside coordinates differently from the non-flipped inside view", async () => {
    const nonFlipped = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: "inside",
    });
    const flipped = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      coordinates: "inside",
      flipped: true,
    });

    expect(flipped.equals(nonFlipped)).toBe(false);
  });

  it("suppresses inside coordinates when a small valid render cannot fit them legibly", async () => {
    const enabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 128,
      style: "cburnett",
      coordinates: "inside",
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 128,
      style: "cburnett",
      coordinates: false,
    });

    expect(enabled.equals(disabled)).toBe(true);
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
        position: "inside",
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
