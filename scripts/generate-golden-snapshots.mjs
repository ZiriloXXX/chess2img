import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ChessImageGenerator, renderChess } from "../dist/index.js";

const goldenDir = join(process.cwd(), "tests", "fixtures", "golden");
await mkdir(goldenDir, { recursive: true });

const fen = (await readFile("tests/fixtures/fen/simple-kings.fen", "utf8")).trim();
const pgn = await readFile("tests/fixtures/pgn/ruy-lopez-short.pgn", "utf8");
const board = JSON.parse(await readFile("tests/fixtures/board/initial-position.json", "utf8"));

await writeFile(
  join(goldenDir, "fen-simple-kings-merida.png"),
  await renderChess({
    fen,
    size: 400,
    style: "merida",
  }),
);

await writeFile(
  join(goldenDir, "pgn-ruy-lopez-short-alpha.png"),
  await renderChess({
    pgn,
    size: 400,
    style: "alpha",
  }),
);

await writeFile(
  join(goldenDir, "board-initial-cburnett.png"),
  await renderChess({
    board,
    size: 400,
    style: "cburnett",
  }),
);

const cheqGenerator = new ChessImageGenerator({
  size: 400,
  style: "cheq",
});
await cheqGenerator.loadFEN("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
cheqGenerator.setHighlights(["e4", "d5"]);
await writeFile(join(goldenDir, "highlight-cheq.png"), await cheqGenerator.toBuffer());

await writeFile(
  join(goldenDir, "flipped-leipzig.png"),
  await renderChess({
    fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
    size: 400,
    style: "leipzig",
    flipped: true,
  }),
);
