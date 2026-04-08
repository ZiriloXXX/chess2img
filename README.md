# chess2img

[![npm version](https://img.shields.io/npm/v/chess2img)](https://www.npmjs.com/package/chess2img)
[![License: MIT](https://img.shields.io/npm/l/chess2img)](https://www.npmjs.com/package/chess2img)

`chess2img` renders PNG chess board images from FEN, PGN, or board-array inputs for Node.js with a small Promise-based API for JavaScript and TypeScript users.

## Quick Start

Install:

```bash
npm install chess2img
```

Render a board image:

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
});

await writeFile("board.png", png);
```

`renderChess(...)` returns a `Promise<Buffer>` containing PNG data.

## Example Output

Example board rendered with a built-in theme:

![Example board output](https://raw.githubusercontent.com/ZiriloXXX/chess2img/main/tests/fixtures/golden/board-initial-cburnett.png)

## Installation

```bash
npm install chess2img
```

## Node And Canvas Requirements

- Node.js `18+`
- native build support for `canvas`
- common Linux packages usually include Cairo, Pango, libpng, libjpeg, giflib, a C/C++ toolchain, and Python for `node-gyp`

If `canvas` fails to install, verify your system packages first. The library ships `canvas` as a direct dependency, but native prerequisites still need to exist on the host.

## JavaScript Usage

```js
const { ChessImageGenerator } = require("chess2img");

async function main() {
  const generator = new ChessImageGenerator({
    size: 800,
    style: "alpha",
  });

  await generator.loadPGN("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
  generator.setHighlights(["e4", "e5"]);

  const buffer = await generator.toBuffer();
  await generator.toFile("board.png");
}

main().catch(console.error);
```

## TypeScript Usage

```ts
import { ChessImageGenerator, renderChess } from "chess2img";

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
  size: 640,
  style: "cburnett",
});

const generator = new ChessImageGenerator({ size: 640, theme: "leipzig" });
await generator.loadFEN("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
await generator.toFile("board.png");
```

## API

### Class API

```ts
const generator = new ChessImageGenerator({
  size: 800,
  style: "merida",
  flipped: false,
});

await generator.loadFEN(fen);
generator.setHighlights(["e4", "d5"]);

const buffer = await generator.toBuffer();
await generator.toFile("board.png");
```

Methods:

- `loadFEN(fen: string): Promise<void>`
- `loadPGN(pgn: string): Promise<void>`
- `loadBoard(board: BoardArray): Promise<void>`
- `setHighlights(squares: Square[]): void`
- `clearHighlights(): void`
- `toBuffer(): Promise<Buffer>`
- `toFile(filePath: string): Promise<void>`

Semantics:

- `setHighlights` replaces the current highlight set
- `clearHighlights` removes all highlights
- loading a new position clears highlights
- constructor defaults persist across position loads

### Functional API

```ts
const buffer = await renderChess({
  fen,
  size: 800,
  style: "merida",
});
```

`renderChess` accepts exactly one of:

- `fen`
- `pgn`
- `board`

## Options Reference

- `size`: board size in pixels
- `padding`: `[top, right, bottom, left]`
- `flipped`: render from black's perspective when `true`
- `style`: built-in theme alias
- `theme`: built-in theme name, registered custom theme name, or inline `ThemeDefinition`
- `highlightSquares`: array of algebraic squares such as `["e4", "d5"]`
- `colors.lightSquare`
- `colors.darkSquare`
- `colors.highlight`

## Built-In Styles

- `merida`
- `alpha`
- `cburnett`
- `cheq`
- `leipzig`

## Custom Themes

Register a reusable theme globally:

```ts
import { registerTheme } from "chess2img";

registerTheme({
  name: "custom-theme",
  displayName: "Custom Theme",
  license: "MIT",
  attribution: "Project-authored",
  pieces: {
    // 12 canonical pieces required
  },
});
```

Or pass either:

- a registered custom theme name through `theme: "custom-theme"`
- an inline `ThemeDefinition` object through `theme: { ... }`

Custom themes may use either:

- `svg` assets
- `png` assets

## Error Model

The library exports:

- `ValidationError`
- `ParseError`
- `ThemeError`
- `RenderError`
- `IOError`

## Architecture Summary

- `core` parses and validates chess position input into a canonical board model
- `themes` validates, registers, and resolves built-in or custom themes
- `render` rasterizes SVG or PNG theme assets and renders PNG output through `canvas`
- `api` orchestrates parsing, theme resolution, rendering, and file output

## Migration From `chess-image-generator`

| Old | New | Difference |
| --- | --- | --- |
| `loadArray` | `loadBoard` | renamed for clarity |
| `highlightSquares([...])` | `setHighlights([...])` | replacement semantics are explicit |
| `generateBuffer()` | `toBuffer()` | same role, new naming |
| `generatePNG(path)` | `toFile(path)` | IO is explicit in the API name |
| `style` only | `style` or `theme` | `theme` is the canonical path |

## Troubleshooting

- `canvas` install failures usually indicate missing native prerequisites on the host
- `ValidationError` from `renderChess` usually means multiple position inputs were provided or an option shape is invalid
- `ThemeError` usually indicates an unknown theme name or an incomplete custom theme definition
- `RenderError` usually indicates asset decoding/rasterization problems

## Asset Attribution

Bundled built-in themes are derived from the upstream `andyruwruw/chess-image-generator` resource packs and are vendored in-package for deterministic installs. Provenance and licensing notes live in [ATTRIBUTION.md](./ATTRIBUTION.md).
