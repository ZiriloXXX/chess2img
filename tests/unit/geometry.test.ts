import { describe, expect, it } from "vitest";
import { createBoardGeometry } from "../../src/core/geometry";

describe("createBoardGeometry", () => {
  it("computes inner board geometry from size, padding, and border", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [20, 20, 20, 20],
      borderSize: 24,
      flipped: false,
    });

    expect(geometry.squareSize).toBe(44);
    expect(geometry.imageWidth).toBe(440);
    expect(geometry.boardOuterX).toBe(20);
    expect(geometry.boardOuterY).toBe(20);
    expect(geometry.boardOuterSize).toBe(400);
    expect(geometry.boardX).toBe(44);
    expect(geometry.boardY).toBe(44);
    expect(geometry.boardSize).toBe(352);
    expect(geometry.borderSize).toBe(24);
    expect(geometry.squares.a8).toEqual({ x: 44, y: 44, size: 44 });
    expect(geometry.squares.h1).toEqual({ x: 352, y: 352, size: 44 });
  });

  it("computes flipped square coordinates and reversed coordinate labels", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 32,
      flipped: true,
    });

    expect(geometry.squares.a8).toEqual({ x: 326, y: 326, size: 42 });
    expect(geometry.squares.h1).toEqual({ x: 32, y: 32, size: 42 });
    expect(geometry.borderFileLabels.map((label) => label.text)).toEqual([
      "h",
      "g",
      "f",
      "e",
      "d",
      "c",
      "b",
      "a",
    ]);
    expect(geometry.borderRankLabels.map((label) => label.text)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
    ]);
  });

  it("computes non-flipped coordinate labels from displayed order", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 24,
      flipped: false,
    });

    expect(geometry.borderFileLabels.map((label) => label.text)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
    ]);
    expect(geometry.borderRankLabels.map((label) => label.text)).toEqual([
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "1",
    ]);
    expect(geometry.borderFileLabels[0]).toMatchObject({ x: 46, y: 388 });
    expect(geometry.borderRankLabels[0]).toMatchObject({ x: 12, y: 46 });
  });

  it("computes inside anchors on the visible outer edge squares only", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: false,
    });

    expect(geometry.insideFileLabels.map((label) => label.square)).toEqual([
      "a1",
      "b1",
      "c1",
      "d1",
      "e1",
      "f1",
      "g1",
      "h1",
    ]);
    expect(geometry.insideRankLabels.map((label) => label.square)).toEqual([
      "a8",
      "a7",
      "a6",
      "a5",
      "a4",
      "a3",
      "a2",
      "a1",
    ]);
  });

  it("reverses inside label order when flipped", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: true,
    });

    expect(geometry.insideFileLabels.map((label) => label.text)).toEqual([
      "h",
      "g",
      "f",
      "e",
      "d",
      "c",
      "b",
      "a",
    ]);
    expect(geometry.insideRankLabels.map((label) => label.text)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
    ]);
    expect(geometry.insideFileLabels[0].square).toBe("h8");
    expect(geometry.insideRankLabels[0].square).toBe("h1");
  });

  it("keeps the dual inside anchors in the visible bottom-left square separated", () => {
    const nonFlipped = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: false,
    });
    const flipped = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      borderSize: 0,
      flipped: true,
    });
    const nonFlippedBottomLeftFile = nonFlipped.insideFileLabels[0];
    const nonFlippedBottomLeftRank = nonFlipped.insideRankLabels[7];
    const flippedBottomLeftFile = flipped.insideFileLabels[0];
    const flippedBottomLeftRank = flipped.insideRankLabels[7];

    expect(nonFlippedBottomLeftFile.square).toBe("a1");
    expect(nonFlippedBottomLeftRank.square).toBe("a1");
    expect(nonFlippedBottomLeftFile.textAlign).toBe("right");
    expect(nonFlippedBottomLeftFile.textBaseline).toBe("bottom");
    expect(nonFlippedBottomLeftRank.textAlign).toBe("left");
    expect(nonFlippedBottomLeftRank.textBaseline).toBe("top");
    expect(nonFlippedBottomLeftFile.x).toBeGreaterThan(nonFlippedBottomLeftRank.x);
    expect(nonFlippedBottomLeftFile.y).toBeGreaterThan(nonFlippedBottomLeftRank.y);

    expect(flippedBottomLeftFile.square).toBe("h8");
    expect(flippedBottomLeftRank.square).toBe("h8");
    expect(flippedBottomLeftFile.textAlign).toBe("right");
    expect(flippedBottomLeftFile.textBaseline).toBe("bottom");
    expect(flippedBottomLeftRank.textAlign).toBe("left");
    expect(flippedBottomLeftRank.textBaseline).toBe("top");
    expect(flippedBottomLeftFile.x).toBeGreaterThan(flippedBottomLeftRank.x);
    expect(flippedBottomLeftFile.y).toBeGreaterThan(flippedBottomLeftRank.y);
  });
});
