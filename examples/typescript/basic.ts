import { ChessImageGenerator, renderChess } from "../../src/index.js";

async function main(): Promise<void> {
  const buffer = await renderChess({
    board: [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ],
    size: 512,
    style: "cburnett",
  });

  console.log("Functional buffer bytes:", buffer.length);

  const generator = new ChessImageGenerator({
    size: 512,
    theme: "leipzig",
    colors: {
      lightSquare: "#f8f2dc",
      darkSquare: "#8a5a44",
      highlight: "rgba(60, 180, 75, 0.4)",
    },
  });

  await generator.loadFEN("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
  generator.setHighlights(["e4", "d5"]);
  await generator.toFile("board.png");
}

void main();
