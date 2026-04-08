import { describe, expect, it } from "vitest";
import { ChessImageGenerator } from "../../src";

describe("highlight lifecycle", () => {
  it("replaces highlights and clears them on load", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");

    const base = await generator.toBuffer();

    generator.setHighlights(["e4"]);
    const oneHighlight = await generator.toBuffer();

    generator.setHighlights(["d5"]);
    const replacedHighlights = await generator.toBuffer();

    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    const clearedOnLoad = await generator.toBuffer();

    expect(oneHighlight.equals(base)).toBe(false);
    expect(replacedHighlights.equals(oneHighlight)).toBe(false);
    expect(clearedOnLoad.equals(base)).toBe(true);
  });

  it("clearHighlights removes active highlights", async () => {
    const generator = new ChessImageGenerator({ size: 400, style: "merida" });
    await generator.loadFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    const base = await generator.toBuffer();

    generator.setHighlights(["e4"]);
    generator.clearHighlights();

    expect((await generator.toBuffer()).equals(base)).toBe(true);
  });
});
