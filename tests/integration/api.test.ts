import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ChessImageGenerator, registerTheme, renderChess } from "../../src";
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
});
