const { ChessImageGenerator, renderChess } = require("chess2img");

async function main() {
  const buffer = await renderChess({
    fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
    size: 480,
    style: "merida",
  });

  console.log("Functional buffer bytes:", buffer.length);

  const generator = new ChessImageGenerator({
    size: 480,
    style: "alpha",
    flipped: false,
  });

  await generator.loadPGN("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
  generator.setHighlights(["e4", "e5"]);
  await generator.toFile("board.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
