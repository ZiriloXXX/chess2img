import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { ChessImageGenerator, renderChess } from "../../src";

async function expectBufferToMatchGolden(buffer: Buffer, goldenPath: string) {
  const expected = await readFile(goldenPath);
  expect(buffer.equals(expected)).toBe(true);
}

describe("render snapshots", () => {
  it("matches fen snapshot for merida", async () => {
    const fen = await readFile("tests/fixtures/fen/simple-kings.fen", "utf8");
    const buffer = await renderChess({
      fen: fen.trim(),
      size: 400,
      style: "merida",
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/fen-simple-kings-merida.png",
    );
  });

  it("matches pgn snapshot for alpha", async () => {
    const pgn = await readFile("tests/fixtures/pgn/ruy-lopez-short.pgn", "utf8");
    const buffer = await renderChess({
      pgn,
      size: 400,
      style: "alpha",
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/pgn-ruy-lopez-short-alpha.png",
    );
  });

  it("matches board-array snapshot for cburnett", async () => {
    const board = JSON.parse(
      await readFile("tests/fixtures/board/initial-position.json", "utf8"),
    ) as string[][];
    const buffer = await renderChess({
      board,
      size: 400,
      style: "cburnett",
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/board-initial-cburnett.png",
    );
  });

  it("matches highlight snapshot for cheq", async () => {
    const generator = new ChessImageGenerator({
      size: 400,
      style: "cheq",
    });

    await generator.loadFEN("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
    generator.setHighlights(["e4", "d5"]);

    await expectBufferToMatchGolden(
      await generator.toBuffer(),
      "tests/fixtures/golden/highlight-cheq.png",
    );
  });

  it("matches flipped snapshot for leipzig", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      size: 400,
      style: "leipzig",
      flipped: true,
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/flipped-leipzig.png",
    );
  });
});
