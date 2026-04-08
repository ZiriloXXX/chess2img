import { describe, expect, it } from "vitest";
import { parseBoardArray, parseFEN, parsePGN } from "../../src/core/parsers";
import { ParseError, ValidationError } from "../../src/types/errors";

describe("parseFEN", () => {
  it("creates a normalized board position", () => {
    const board = parseFEN("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    expect(board.squares.e1).toBe("wK");
    expect(board.squares.e8).toBe("bK");
  });

  it("rejects malformed fen", () => {
    expect(() => parseFEN("invalid")).toThrow(ParseError);
  });
});

describe("parsePGN", () => {
  it("returns the final position from a game", () => {
    const board = parsePGN("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
    expect(board.squares.a6).toBe("bP");
    expect(board.squares.b5).toBe("wB");
  });

  it("rejects malformed pgn", () => {
    expect(() => parsePGN("1. definitely-not-a-move")).toThrow(ParseError);
  });
});

describe("parseBoardArray", () => {
  it("maps array rows from a8 to h1", () => {
    const board = parseBoardArray([
      ["r", null, null, null, "k", null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, "K", null, null, "R"],
    ]);

    expect(board.squares.a8).toBe("bR");
    expect(board.squares.e8).toBe("bK");
    expect(board.squares.e1).toBe("wK");
    expect(board.squares.h1).toBe("wR");
  });

  it("rejects invalid board dimensions", () => {
    expect(() => parseBoardArray([["K"]] as never)).toThrow(ValidationError);
  });
});
