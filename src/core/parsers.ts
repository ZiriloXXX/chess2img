import { Chess } from "chess.js";
import type { BoardArray, BoardCell, PieceKey } from "../types/types";
import { ParseError, ValidationError } from "../types/errors";
import { createEmptyBoardPosition, FILES } from "./board";
import { validateBoardArray } from "./validators";

const PIECE_SYMBOL_TO_KEY: Record<string, PieceKey> = {
  K: "wK",
  Q: "wQ",
  R: "wR",
  B: "wB",
  N: "wN",
  P: "wP",
  k: "bK",
  q: "bQ",
  r: "bR",
  b: "bB",
  n: "bN",
  p: "bP",
};

function chessBoardToBoardArray(board: ReturnType<Chess["board"]>): BoardArray {
  return board.map((rank) =>
    rank.map((piece): BoardCell => {
      if (!piece) {
        return null;
      }

      return piece.color === "w" ? piece.type.toUpperCase() : piece.type;
    }),
  );
}

export function parseFEN(fen: string) {
  const chess = new Chess();

  try {
    chess.load(fen);
  } catch (error) {
    throw new ParseError("Invalid FEN", { cause: error });
  }

  return parseBoardArray(chessBoardToBoardArray(chess.board()));
}

export function parsePGN(pgn: string) {
  const chess = new Chess();

  try {
    chess.loadPgn(pgn);
  } catch (error) {
    throw new ParseError("Invalid PGN", { cause: error });
  }

  return parseBoardArray(chessBoardToBoardArray(chess.board()));
}

export function parseBoardArray(board: BoardArray) {
  const validatedBoard = validateBoardArray(board);
  const position = createEmptyBoardPosition();

  validatedBoard.forEach((rank, rankIndex) => {
    rank.forEach((cell, fileIndex) => {
      if (cell === null) {
        return;
      }

      const pieceKey = PIECE_SYMBOL_TO_KEY[cell];

      if (!pieceKey) {
        throw new ValidationError(`Invalid board piece: ${cell}`);
      }

      const square = `${FILES[fileIndex]}${8 - rankIndex}` as keyof typeof position.squares;
      position.squares[square] = pieceKey;
    });
  });

  return position;
}
