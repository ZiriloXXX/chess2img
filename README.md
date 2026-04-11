# chess2img

<div align="center">
  <img src="./assets/themes/cburnett/wK.png" alt="chess2img king icon" width="88" />
  <p>Generate PNG, SVG, and JPEG chessboard images from FEN, PGN, or board arrays in Node.js.</p>
  <p>
    <a href="https://www.npmjs.com/package/chess2img"><img src="https://img.shields.io/npm/v/chess2img" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/chess2img"><img src="https://img.shields.io/npm/dm/chess2img" alt="npm downloads" /></a>
    <a href="https://www.npmjs.com/package/chess2img"><img src="https://img.shields.io/npm/l/chess2img" alt="license" /></a>
    <a href="https://github.com/ZiriloXXX/chess2img"><img src="https://img.shields.io/github/stars/ZiriloXXX/chess2img" alt="GitHub stars" /></a>
  </p>
</div>

## Overview

`chess2img` renders chessboard PNG, SVG, and JPEG images from FEN, PGN, or board-array inputs with a small Promise-based API for JavaScript and TypeScript users on Node.js.

Supported output formats:

- PNG
- SVG
- JPEG

## Features

- Render PNG, SVG, or JPEG chessboard images from `fen`, `pgn`, or `board` input.
- Use five bundled built-in themes: `merida`, `alpha`, `cburnett`, `cheq`, and `leipzig`.
- Highlight squares such as the last move or key tactical ideas.
- Customize board colors, size, padding, border sizing, coordinates, and board orientation.
- Use either the functional `renderChess(...)` API or the `ChessImageGenerator` class API.
- Register custom themes globally or pass a theme inline for one-off rendering.
- Consume the package from both JavaScript and TypeScript projects.

## Example Output

Opening `1.e4` with a Chess.com-like board palette, highlighted origin and destination squares, and the built-in `cburnett` piece set.

<img src="./assets/readme/chesscom-opening-e4-cburnett.png" alt="Opening 1.e4 example board" width="480" />

## Quick Start

```bash
npm install chess2img
```

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  colors: {
    lightSquare: "#EEEED2",
    darkSquare: "#769656",
    highlight: "rgba(246, 246, 105, 0.6)",
  },
  highlights: ["e2", "e4"],
});

await writeFile("board.png", png);
```

`renderChess(...)` returns a `Promise<Buffer>` containing PNG data.

### SVG Output

```ts
import { writeFile } from "node:fs/promises";
import { renderSvg } from "chess2img";

const svg = await renderSvg({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

await writeFile("board.svg", svg, "utf8");
```

### JPEG Output

```ts
import { writeFile } from "node:fs/promises";
import { renderJpeg } from "chess2img";

const jpeg = await renderJpeg({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

await writeFile("board.jpg", jpeg);
```

## Installation

```bash
npm install chess2img
```

### Node And Canvas Requirements

- Node.js `18+`
- native build support for `canvas`
- common Linux packages usually include Cairo, Pango, libpng, libjpeg, giflib, a C/C++ toolchain, and Python for `node-gyp`

If `canvas` fails to install, verify your system packages first. The library ships `canvas` as a direct dependency, but native prerequisites still need to exist on the host.

## Basic Usage

### Functional API

```ts
import { renderFile } from "chess2img";

await renderFile("board.png", {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  size: 480,
  style: "merida",
});
```

`renderChess(...)` and `renderFile(...)` are the explicit PNG APIs.

### Direct PNG, SVG, And JPEG Buffers

```ts
import { renderChess, renderJpeg, renderSvg } from "chess2img";

const png = await renderChess({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

const svg = await renderSvg({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

const jpeg = await renderJpeg({
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});
```

### SVG And JPEG File Helpers

```ts
import { renderFile, renderJpegFile, renderSvgFile } from "chess2img";

await renderFile("board.png", {
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

await renderSvgFile("board.svg", {
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});

await renderJpegFile("board.jpg", {
  fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
  style: "merida",
});
```

### Automatic Coordinates

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  coordinates: true,
});

await writeFile("board-with-auto-coordinates.png", png);
```

`coordinates: true` chooses `border` mode when `borderSize > 0`, otherwise it falls back to `inside` mode.

### Border Coordinates

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  borderSize: 24,
  coordinates: {
    enabled: true,
    position: "border",
    color: "#333",
  },
});

await writeFile("board-with-border-coordinates.png", png);
```

### Inside Coordinates

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  coordinates: "inside",
});

await writeFile("board-with-inside-coordinates.png", png);
```

### Circle Highlights

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  highlights: [{ square: "e4", style: "circle" }],
});

await writeFile("board-with-circle-highlight.png", png);
```

### Combined Fill And Circle Highlights

```ts
import { writeFile } from "node:fs/promises";
import { renderChess } from "chess2img";

const png = await renderChess({
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  size: 480,
  style: "cburnett",
  highlights: ["e4", { square: "e4", style: "circle" }],
});

await writeFile("board-with-fill-and-circle-highlights.png", png);
```

### Class API

```ts
import { ChessImageGenerator } from "chess2img";

const generator = new ChessImageGenerator({
  size: 800,
  style: "alpha",
});

await generator.loadPGN("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");
generator.setHighlights(["e4", "e5"]);

const png = await generator.toBuffer();
const svg = await generator.toSvg();
const jpeg = await generator.toJpeg();

await generator.toFile("board.png");
await generator.toSvgFile("board.svg");
await generator.toJpegFile("board.jpg");
```

Class method summary:

- `toBuffer()` -> PNG `Buffer`
- `toFile(path)` -> writes PNG
- `toSvg()` -> SVG `string`
- `toSvgFile(path)` -> writes SVG
- `toJpeg()` -> JPEG `Buffer`
- `toJpegFile(path)` -> writes JPEG

### JavaScript Usage

```js
const { renderChess } = require("chess2img");
const { writeFile } = require("node:fs/promises");

async function main() {
  const png = await renderChess({
    fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
    style: "merida",
  });

  await writeFile("board.png", png);
}

main().catch(console.error);
```

## Built-In Themes

Bundled built-in themes:

- `merida`
- `alpha`
- `cburnett`
- `cheq`
- `leipzig`

Built-in themes are vendored in-package and render through the same theme pipeline as custom themes.

## Custom Piece Packs

Register a reusable theme globally:

```ts
import { registerTheme } from "chess2img";

registerTheme({
  name: "custom-theme",
  displayName: "Custom Theme",
  license: "MIT",
  attribution: "Theme author or package source",
  pieces: {
    // 12 canonical pieces required
  },
});
```

Or pass either:

- a registered custom theme name through `theme: "custom-theme"`
- an inline `ThemeDefinition` object through `theme: { ... }`

Custom piece packs may use either:

- `svg` assets
- `png` assets

Expected piece-pack structure:

```text
my-pack/
  wK.svg
  wQ.svg
  wR.svg
  wB.svg
  wN.svg
  wP.svg
  bK.svg
  bQ.svg
  bR.svg
  bB.svg
  bN.svg
  bP.svg
```

You can point the theme definition at either SVG or PNG files. Mixing formats is also supported as long as all 12 canonical pieces are present.

### Example Third-Party Packs

- `chess.com-boards-and-pieces`: https://github.com/GiorgioMegrelli/chess.com-boards-and-pieces

These are third-party repositories. They are not bundled with `chess2img`, and you should verify each pack's license terms before redistribution or repackaging.

## API

### Public Exports

- `new ChessImageGenerator(options?)`
- `renderChess(options)`
- `renderSvg(options)`
- `renderJpeg(options)`
- `renderFile(path, options)`
- `renderSvgFile(path, options)`
- `renderJpegFile(path, options)`
- `registerTheme(theme)`

### Functional API

`renderChess(...)`, `renderSvg(...)`, and `renderJpeg(...)` accept exactly one position source:

- `fen`
- `pgn`
- `board`

Return values:

- `renderChess(...)` -> `Promise<Buffer>` containing PNG data
- `renderSvg(...)` -> `Promise<string>` containing SVG markup
- `renderJpeg(...)` -> `Promise<Buffer>` containing JPEG data

File helpers:

- `renderFile(path, options)` -> writes PNG only
- `renderSvgFile(path, options)` -> writes SVG only
- `renderJpegFile(path, options)` -> writes JPEG only

### Class API

Methods:

- `loadFEN(fen: string): Promise<void>`
- `loadPGN(pgn: string): Promise<void>`
- `loadBoard(board: BoardArray): Promise<void>`
- `setHighlights(highlights: HighlightInput[]): void`
- `clearHighlights(): void`
- `toBuffer(): Promise<Buffer>`
- `toFile(filePath: string): Promise<void>`
- `toSvg(): Promise<string>`
- `toSvgFile(filePath: string): Promise<void>`
- `toJpeg(): Promise<Buffer>`
- `toJpegFile(filePath: string): Promise<void>`

Semantics:

- `setHighlights` replaces the current highlight set
- `clearHighlights` removes all highlights
- loading a new position clears highlights
- constructor defaults persist across position loads

### Options

- `size`: board size in pixels
- `padding`: `[top, right, bottom, left]`
- `borderSize`: inner border size in pixels, from `0` up to `Math.floor(size / 8)`
- `flipped`: render from black's perspective when `true`
- `style`: built-in theme alias
- `theme`: built-in theme name, registered custom theme name, or inline `ThemeDefinition`
- `highlights`: array of square strings or highlight objects such as `["e4", { square: "d5", style: "circle" }]`
- `highlightSquares`: compatibility alias for `highlights`
- `coordinates`: `boolean`, `"border"`, `"inside"`, or `{ enabled?: boolean; position?: "border" | "inside"; color?: string }`
- `colors.lightSquare`
- `colors.darkSquare`
- `colors.highlight`

`coordinates: false` or omitting the option disables labels. `coordinates: true` enables labels and chooses `border` mode when `borderSize > 0`, otherwise `inside` mode. Explicit `coordinates: "inside"` is always valid. Explicit `coordinates: "border"` requires `borderSize > 0` and throws `ValidationError` otherwise.

`highlights` is the preferred API. Each entry may be a square string for a filled highlight, or an object with `square`, `style`, `color`, `opacity`, `lineWidth`, and `radius`. `highlightSquares` remains available for backward compatibility, but should not be used together with `highlights` in the same call.

Inside coordinates use automatic light/dark contrast by default, similar to chess.com. If `coordinates.color` is provided, that exact color is used instead. Border coordinates keep a single-color label style with `#333` as the default.

At very small valid sizes, the renderer suppresses coordinates when they cannot fit legibly in the available border band or edge-square area.

### Errors

The library exports:

- `ValidationError`
- `ParseError`
- `ThemeError`
- `RenderError`
- `IOError`

## License

`chess2img` is distributed under the MIT license in package metadata.

Bundled built-in themes are derived from the upstream `andyruwruw/chess-image-generator` resource packs and are vendored in-package for deterministic installs. Provenance and licensing notes live in [ATTRIBUTION.md](./ATTRIBUTION.md).
