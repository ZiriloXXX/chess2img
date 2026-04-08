import { describe, expect, it } from "vitest";
import { createBoardGeometry } from "../../src/core/geometry";

describe("createBoardGeometry", () => {
  it("computes square coordinates from size and padding", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [20, 20, 20, 20],
      flipped: false,
    });

    expect(geometry.squareSize).toBe(50);
    expect(geometry.imageWidth).toBe(440);
    expect(geometry.squares.a8).toEqual({ x: 20, y: 20, size: 50 });
    expect(geometry.squares.h1).toEqual({ x: 370, y: 370, size: 50 });
  });

  it("computes flipped coordinates", () => {
    const geometry = createBoardGeometry({
      size: 400,
      padding: [0, 0, 0, 0],
      flipped: true,
    });

    expect(geometry.squares.a8).toEqual({ x: 350, y: 350, size: 50 });
    expect(geometry.squares.h1).toEqual({ x: 0, y: 0, size: 50 });
  });
});
