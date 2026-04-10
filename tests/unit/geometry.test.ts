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
    expect(geometry.fileLabels.map((label) => label.text)).toEqual([
      "h",
      "g",
      "f",
      "e",
      "d",
      "c",
      "b",
      "a",
    ]);
    expect(geometry.rankLabels.map((label) => label.text)).toEqual([
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

    expect(geometry.fileLabels.map((label) => label.text)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
    ]);
    expect(geometry.rankLabels.map((label) => label.text)).toEqual([
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "1",
    ]);
    expect(geometry.fileLabels[0]).toMatchObject({ x: 46, y: 388 });
    expect(geometry.rankLabels[0]).toMatchObject({ x: 12, y: 46 });
  });
});
