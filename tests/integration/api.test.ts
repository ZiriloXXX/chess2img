import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ChessImageGenerator,
  registerTheme,
  renderChess,
  renderFile,
  renderJpeg,
  renderJpegFile,
  renderSvg,
  renderSvgFile,
} from "../../src";
import { ThemeError, ValidationError } from "../../src/types/errors";

describe("renderChess", () => {
  it("renders from FEN using the functional API", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "merida",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("rejects ambiguous input sources", async () => {
    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        pgn: "1. e4 e5",
        size: 400,
      } as never),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("accepts registered custom theme names at runtime", async () => {
    registerTheme({
      name: "api-custom-theme",
      displayName: "API Custom Theme",
      license: "MIT",
      attribution: "Upstream-derived test fixture",
      pieces: {
        wK: { kind: "png", source: "assets/themes/merida/wK.png" },
        wQ: { kind: "png", source: "assets/themes/merida/wQ.png" },
        wR: { kind: "png", source: "assets/themes/merida/wR.png" },
        wB: { kind: "png", source: "assets/themes/merida/wB.png" },
        wN: { kind: "png", source: "assets/themes/merida/wN.png" },
        wP: { kind: "png", source: "assets/themes/merida/wP.png" },
        bK: { kind: "png", source: "assets/themes/merida/bK.png" },
        bQ: { kind: "png", source: "assets/themes/merida/bQ.png" },
        bR: { kind: "png", source: "assets/themes/merida/bR.png" },
        bB: { kind: "png", source: "assets/themes/merida/bB.png" },
        bN: { kind: "png", source: "assets/themes/merida/bN.png" },
        bP: { kind: "png", source: "assets/themes/merida/bP.png" },
      },
    });

    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      theme: "api-custom-theme",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("rejects malformed inline themes as ThemeError before render", async () => {
    await expect(
      renderChess({
        fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
        size: 400,
        theme: {
          name: "broken-inline-theme",
          displayName: "Broken Inline Theme",
          license: "MIT",
          attribution: "Broken fixture",
          pieces: {
            bQ: { kind: "png", source: "assets/themes/merida/bQ.png" },
          },
        } as never,
      }),
    ).rejects.toBeInstanceOf(ThemeError);
  });
});

describe("format-specific functional APIs", () => {
  const fen = "4k3/8/8/8/8/8/8/4K3 w - - 0 1";

  it("renders SVG with the functional API", async () => {
    const svg = await renderSvg({
      fen,
      size: 400,
      style: "merida",
      highlights: [{ square: "e4", style: "circle" }],
      coordinates: "inside",
    });

    expect(typeof svg).toBe("string");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("<rect");
    expect(svg).toContain("<circle");
    expect(svg).toContain("<text");
  });

  it("renders JPEG with the functional API", async () => {
    const jpeg = await renderJpeg({
      fen,
      size: 400,
      style: "merida",
    });

    expect(Buffer.isBuffer(jpeg)).toBe(true);
    expect(jpeg.subarray(0, 3).toString("hex")).toBe("ffd8ff");
  });

  it("writes PNG files via renderFile", async () => {
    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const filePath = join(dir, "board.png");

    await renderFile(filePath, {
      fen,
      size: 400,
      style: "merida",
    });

    const file = await readFile(filePath);
    expect(file.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("writes SVG files via renderSvgFile", async () => {
    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const filePath = join(dir, "board.svg");

    await renderSvgFile(filePath, {
      fen,
      size: 400,
      style: "merida",
    });

    const file = await readFile(filePath, "utf8");
    expect(file.startsWith("<svg")).toBe(true);
  });

  it("writes JPEG files via renderJpegFile", async () => {
    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const filePath = join(dir, "board.jpg");

    await renderJpegFile(filePath, {
      fen,
      size: 400,
      style: "merida",
    });

    const file = await readFile(filePath);
    expect(file.subarray(0, 3).toString("hex")).toBe("ffd8ff");
  });
});

describe("ChessImageGenerator", () => {
  it("writes a file from the class API", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");

    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const filePath = join(dir, "board.png");
    await generator.toFile(filePath);

    const file = await readFile(filePath);
    expect(file.byteLength).toBeGreaterThan(0);
    expect(file.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("renders SVG from the class API", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");

    const svg = await generator.toSvg();

    expect(typeof svg).toBe("string");
    expect(svg.startsWith("<svg")).toBe(true);
  });

  it("renders JPEG from the class API", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");

    const jpeg = await generator.toJpeg();

    expect(Buffer.isBuffer(jpeg)).toBe(true);
    expect(jpeg.subarray(0, 3).toString("hex")).toBe("ffd8ff");
  });

  it("writes SVG and JPEG files from the class API", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");

    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const svgPath = join(dir, "board.svg");
    const jpegPath = join(dir, "board.jpg");

    await generator.toSvgFile(svgPath);
    await generator.toJpegFile(jpegPath);

    const svg = await readFile(svgPath, "utf8");
    const jpeg = await readFile(jpegPath);

    expect(svg.startsWith("<svg")).toBe(true);
    expect(jpeg.subarray(0, 3).toString("hex")).toBe("ffd8ff");
  });
});
