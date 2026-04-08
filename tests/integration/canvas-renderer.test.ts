import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { parseFEN } from "../../src/core/parsers";
import { CanvasPngRenderer } from "../../src/render/canvas-renderer";
import { resolveTheme } from "../../src/themes/resolver";
import type { ThemeDefinition } from "../../src/types/types";

describe("CanvasPngRenderer", () => {
  it("renders a PNG buffer", async () => {
    const renderer = new CanvasPngRenderer();
    const buffer = await renderer.render({
      board: parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1"),
      theme: resolveTheme({ style: "merida" }),
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0],
      flipped: false,
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
      flipped: false,
      colors: {
        lightSquare: "#f0d9b5",
        darkSquare: "#b58863",
        highlight: "#ffcc0080",
      },
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
