import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderSvg } from "../../src";

describe("SvgRenderer", () => {
  it("embeds built-in PNG theme assets as base64 image elements", async () => {
    const svg = await renderSvg({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 320,
      style: "merida",
    });

    expect(svg).toContain("<image");
    expect(svg).toContain("data:image/png;base64,");
  });

  it("embeds custom SVG theme assets directly", async () => {
    const dir = await mkdtemp(join(tmpdir(), "chess2img-svg-theme-"));
    const pieceNames = [
      "wK", "wQ", "wR", "wB", "wN", "wP",
      "bK", "bQ", "bR", "bB", "bN", "bP",
    ] as const;

    const pieceSource = [
      "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\">",
      "<circle cx=\"50\" cy=\"50\" r=\"42\" fill=\"#111\" />",
      "<path id=\"test-piece-mark\" d=\"M20 80 L50 20 L80 80 Z\" fill=\"#fff\" />",
      "</svg>",
    ].join("");

    for (const pieceName of pieceNames) {
      await writeFile(join(dir, `${pieceName}.svg`), pieceSource, "utf8");
    }

    const svg = await renderSvg({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 320,
      theme: {
        name: "test-inline-svg-theme",
        displayName: "Test Inline SVG Theme",
        license: "MIT",
        attribution: "Tests",
        pieces: Object.fromEntries(
          pieceNames.map((pieceName) => [
            pieceName,
            { kind: "svg", source: join(dir, `${pieceName}.svg`) },
          ]),
        ) as Record<(typeof pieceNames)[number], { kind: "svg"; source: string }>,
      },
    });

    expect(svg).toContain("test-piece-mark");
    expect(svg).not.toContain("data:image/png;base64,");
  });
});
