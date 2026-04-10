import { createCanvas, loadImage } from "canvas";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { ChessImageGenerator, renderChess } from "../../src";

async function expectBufferToMatchGolden(buffer: Buffer, goldenPath: string) {
  const expected = await readFile(goldenPath);
  expect(buffer.equals(expected)).toBe(true);
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

  it("matches coordinates-enabled snapshot for cburnett", async () => {
    const buffer = await renderChess({
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

    expect(buffer.equals(disabled)).toBe(false);
    expect(
      await countDifferingPixels(
        buffer,
        disabled,
        { x: 0, y: 24, width: 24, height: 352 },
      ),
    ).toBeGreaterThan(20);
  });

  it("matches coordinates-disabled snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: false,
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/coordinates-disabled-cburnett.png",
    );
  });

  it("matches flipped coordinates snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: {
        enabled: true,
        position: "border",
        color: "#333",
      },
      flipped: true,
    });
    const disabled = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      borderSize: 24,
      coordinates: false,
      flipped: false,
    });

    expect(buffer.equals(disabled)).toBe(false);
    expect(
      await countDifferingPixels(
        buffer,
        disabled,
        { x: 24, y: 376, width: 352, height: 24 },
      ),
    ).toBeGreaterThan(100);
    expect(
      await countDifferingPixels(
        buffer,
        disabled,
        { x: 0, y: 24, width: 24, height: 352 },
      ),
    ).toBeGreaterThan(100);
  });

  it("matches bordered board snapshot without breaking piece placement", async () => {
    const buffer = await renderChess({
      board: JSON.parse(
        await readFile("tests/fixtures/board/initial-position.json", "utf8"),
      ) as string[][],
      size: 400,
      style: "merida",
      borderSize: 24,
      coordinates: false,
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/bordered-initial-merida.png",
    );
  });

  it("matches fill highlight snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: ["e4"],
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/highlight-fill-cburnett.png",
    );
  });

  it("matches circle highlight snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle" }],
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/highlight-circle-cburnett.png",
    );
  });

  it("matches combined fill and circle highlight snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: ["e4", { square: "e4", style: "circle" }],
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/highlight-fill-circle-cburnett.png",
    );
  });

  it("matches custom-radius circle highlight snapshot for cburnett", async () => {
    const buffer = await renderChess({
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
      style: "cburnett",
      highlights: [{ square: "e4", style: "circle", radius: 0.5 }],
    });

    await expectBufferToMatchGolden(
      buffer,
      "tests/fixtures/golden/highlight-circle-radius-cburnett.png",
    );
  });
});
