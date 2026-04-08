import { describe, expect, it } from "vitest";
import { parseFEN } from "../../src/core/parsers";
import { CanvasPngRenderer } from "../../src/render/canvas-renderer";
import { resolveTheme } from "../../src/themes/resolver";

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
});
