# Chess Image Library Rewrite Design

## Summary

This project is a modern TypeScript rewrite of the open source `chess-image-generator` library for Node.js 18+.
The rewrite preserves the core product behavior of generating chess board PNG images from FEN, PGN, or board-array inputs, while replacing the old implementation with a modular, testable, type-safe architecture.

The new library will:

- target JavaScript and TypeScript consumers
- ship ESM, CommonJS, and `.d.ts` outputs
- use `tsup` for builds
- use `chess.js` for chess parsing/state
- use `canvas` as the default rendering backend
- ship five built-in piece themes from day one:
  - `merida`
  - `alpha`
  - `cburnett`
  - `cheq`
  - `leipzig`
- use vendored SVG assets as canonical piece sources
- render PNG output initially, with architecture prepared for SVG support later

This is a clean rewrite, not a structural port of the original codebase.

## Goals

- Preserve the useful capabilities of the original library:
  - load chess positions from FEN, PGN, or board arrays
  - render PNG buffers and write PNG files
  - support configurable board size, padding, colors, orientation, highlights, and piece themes
- Provide a modern API for both class-based and functional usage
- Keep the internal architecture modular and maintainable
- Make themes and renderers extensible from the start
- Add strong type definitions, runtime validation, meaningful error classes, and automated tests

## Non-Goals

- Backward-compatible method aliases such as `loadArray`, `generatePNG`, or `generateBuffer`
- Browser support in v1
- Multiple output formats in v1 beyond PNG
- Over-engineered plugin infrastructure beyond the required theme and renderer boundaries

## Public API

### Entry Points

The package will publicly expose:

- `ChessImageGenerator`
- `renderChess`
- `registerTheme`
- public types
- public error classes

The public API surface is intentionally small and stable.

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

Supported methods:

- `constructor(options?: ChessImageGeneratorOptions)`
- `loadFEN(fen: string): Promise<void>`
- `loadPGN(pgn: string): Promise<void>`
- `loadBoard(board: BoardArray): Promise<void>`
- `setHighlights(squares: Square[]): void`
- `clearHighlights(): void`
- `toBuffer(): Promise<Buffer>`
- `toFile(filePath: string): Promise<void>`

Behavior rules:

- constructor options define validated default render options
- `setHighlights` replaces the current highlight set
- `clearHighlights` removes all highlights
- any successful `loadFEN`, `loadPGN`, or `loadBoard` call clears current highlights
- render defaults persist across position loads
- all public methods remain Promise-based where async behavior is part of the contract

### Functional API

```ts
const buffer = await renderChess({
  fen,
  size: 800,
  style: "merida",
});
```

`renderChess` is stateless and returns `Promise<Buffer>`.

It accepts exactly one position source:

- `fen`
- `pgn`
- `board`

The type model will use discriminated unions so mutually exclusive position inputs are expressed at the type level as much as possible, with runtime validation enforcing the same rule.

### Theme API

Global registration:

```ts
registerTheme(theme);
```

Inline one-off injection:

```ts
new ChessImageGenerator({ theme });
await renderChess({ fen, theme });
```

Resolution order:

1. inline `ThemeDefinition`
2. explicit `theme` name
3. `style` alias mapped to a built-in theme name
4. default built-in theme `merida`

`theme` is the only canonical internal theme path.
`style` exists only as a convenience alias for built-in theme names.

## Public Types

Public types will include:

- `RenderChessOptions`
- `ChessImageGeneratorOptions`
- `ThemeDefinition`
- `PieceStyle`
- `Padding`
- `Square`
- `BoardArray`

Representative definitions:

```ts
export type Square = string;

export type PieceStyle =
  | "merida"
  | "alpha"
  | "cburnett"
  | "cheq"
  | "leipzig";

export type Padding = [number, number, number, number];

export type BoardArray = Array<Array<string | null>>;
```

The final implementation will use stronger internal types where practical while keeping the public API ergonomic.

## Public Errors

The package will export typed public errors:

- `ValidationError`
- `ParseError`
- `ThemeError`
- `RenderError`
- `IOError`

Error boundaries:

- `ValidationError`
  - invalid size
  - invalid padding
  - invalid highlight square
  - invalid board-array shape
  - duplicate or invalid theme registration name
  - ambiguous or missing position source in the functional API
- `ParseError`
  - malformed FEN
  - malformed PGN
  - board content that cannot be parsed into a legal position model
- `ThemeError`
  - unknown theme
  - malformed theme definition
  - incomplete piece map
  - missing vector asset
- `RenderError`
  - rasterization failure
  - composition failure
  - PNG encoding failure
- `IOError`
  - invalid output path
  - file write failures

The library will fail fast and keep parse, theme, render, and IO failures clearly separated for easier diagnosis and programmatic handling.

## Architecture

The system will use a layered architecture with clear boundaries between chess state normalization, theme resolution, rendering, and API orchestration.

### Source Layout

```text
src/
  api/
    class-api.ts
    functional-api.ts
    theme-api.ts
  core/
    board.ts
    parsers.ts
    validators.ts
    geometry.ts
    highlights.ts
  render/
    renderer.ts
    canvas-renderer.ts
    asset-cache.ts
    rasterizer.ts
  themes/
    builtins.ts
    registry.ts
    resolver.ts
    validation.ts
  types/
    types.ts
    errors.ts
  utils/
    io.ts
    normalization.ts
  index.ts
assets/
  themes/
    merida/
    alpha/
    cburnett/
    cheq/
    leipzig/
examples/
tests/
```

### Layer Responsibilities

`src/core`

- defines the canonical board model
- parses FEN, PGN, and board arrays into normalized board state
- validates inputs and options
- normalizes highlight coordinates
- computes board geometry independent of rendering

`src/render`

- defines the renderer contract
- implements the canvas-based PNG renderer
- rasterizes vector piece assets for PNG output
- caches rendered piece bitmaps

`src/themes`

- defines and validates `ThemeDefinition`
- registers built-in themes and custom themes
- resolves canonical theme definitions from inline objects or names
- owns bundled asset metadata and provenance references

`src/api`

- exposes `ChessImageGenerator`
- exposes `renderChess`
- exposes theme registration
- orchestrates validation, parsing, theme resolution, rendering, and file writing

`src/types`

- holds public-facing types and error classes

`src/utils`

- contains small non-domain helpers such as IO and normalization helpers

### Boundary Rules

- parsers produce a normalized `BoardPosition`
- renderers consume `BoardPosition` and never parse FEN or PGN directly
- themes resolve assets and metadata but do not know chess rules
- IO stays outside renderer internals
- the API layer remains thin and orchestration-focused

## Canonical Board Model

`BoardPosition` is the canonical normalized board state used for rendering.
It represents only the final position state needed for rendering and does not expose parser-specific or `chess.js`-specific structures.

Internal representation rules:

- canonical square ordering is fixed as rank/file order from `a8` through `h1`
- board data is stored in a deterministic square-indexed structure
- piece placement helper arrays may exist as derived forms, but the canonical model is optimized for deterministic parsing, rendering, and testing
- no renderer-specific metadata is stored in the board model

Representative internal shape:

```ts
type PieceKey =
  | "wK" | "wQ" | "wR" | "wB" | "wN" | "wP"
  | "bK" | "bQ" | "bR" | "bB" | "bN" | "bP";

interface BoardPosition {
  squares: Record<Square, PieceKey | null>;
}
```

This canonical structure ensures deterministic snapshots and consistent traversal across parsing, geometry, and rendering.

## Theme System

### ThemeDefinition

Built-in and custom themes share the same contract.

Representative structure:

```ts
interface ThemeDefinition {
  name: string;
  displayName: string;
  license: string;
  attribution: string;
  pieces: Record<PieceKey, SvgAssetSource>;
}

interface SvgAssetSource {
  kind: "svg";
  source: string;
}
```

The vector asset abstraction is intentionally narrow in v1.
SVG is the explicit canonical vector source format.
The system is designed so future renderers can reuse those same vector sources without making the abstraction artificially generic.

### Built-In Themes

The package will bundle five built-in themes:

- `merida`
- `alpha`
- `cburnett`
- `cheq`
- `leipzig`

All built-in assets are vendored in-repo under a dedicated assets directory.
No built-in theme assets are fetched from external packages or network sources at runtime or build time.

### Registration Rules

`registerTheme(theme)` will:

- normalize and validate the theme name
- validate required metadata
- validate that all 12 canonical pieces are present
- reject duplicate names
- store the validated theme in the shared registry

Duplicate names are errors in v1.
No implicit override behavior is provided.

### Resolution Model

Theme resolution is isolated from rendering logic and supports:

- inline `ThemeDefinition`
- explicit built-in or registered theme name
- built-in convenience `style` alias

Inline theme definitions do not mutate global registry state.

## Rendering Pipeline

The rendering pipeline is:

1. validate inputs and classify errors
2. parse `fen`, `pgn`, or `board` into `BoardPosition`
3. resolve theme via the registry and theme resolver
4. compute board geometry from `size` and `padding`
5. paint board and highlight overlays
6. resolve vector piece assets
7. rasterize piece assets for the target square size
8. cache rasterized piece bitmaps
9. composite pieces and encode PNG
10. return the PNG buffer or pass it to IO for file writing

### Geometry

Geometry computation is separate from drawing.
The geometry step computes:

- board bounds
- square size
- image width and height
- per-square pixel coordinates

This keeps the renderer simpler and makes geometry independently testable.

### Asset And Raster Caching

The library will not repeatedly reload or rerender piece images unnecessarily.

Cache responsibilities:

- asset lookup cache for canonical vector sources
- raster cache for rendered piece bitmaps

Raster cache key design:

- includes theme identity
- includes piece key
- includes target square size
- remains extensible for renderer-aware context in the future

The cache stores reusable piece render results, not whole-board images.
That keeps board colors, highlights, and orientation dynamic without invalidating coarse-grained board caches.

### Renderer Contract

The PNG renderer owns final PNG encoding and returns `Promise<Buffer>`.
Future SVG support will be implemented as a separate renderer path and output contract rather than forcing PNG-oriented assumptions into shared code.

## Highlight Semantics

Highlights are normalized before use:

- validate square coordinates
- normalize square casing/format
- deduplicate
- keep deterministic storage order for testability

Class API semantics:

- `setHighlights` replaces the current set
- `clearHighlights` clears the set
- loading a new position clears highlights by default

Functional API semantics:

- highlights are provided only for that render call

## Validation Rules

Runtime validation covers:

- board size
- padding tuple length and values
- square coordinates
- theme/style existence
- custom theme completeness
- board array shape
- discriminated render input ambiguity

Validation boundaries:

- malformed FEN or PGN is a `ParseError`
- structurally invalid board-array shape is a `ValidationError`
- invalid highlight square input is a `ValidationError`

These boundaries will be explicitly tested and documented.

## Packaging

### Tooling

- language: TypeScript
- build: `tsup`
- test: `vitest`
- runtime target: Node.js 18+

### Outputs

The package will publish:

- ESM output
- CommonJS output
- type declarations

It will use a modern `exports` map with explicit:

- `import`
- `require`
- `types`

### Dependencies

Direct runtime dependencies:

- `canvas`
- `chess.js`

The package will not declare `fs` or `path` as dependencies.
File IO uses Node built-ins via `fs/promises`.

### Published Artifact Policy

The published package must include:

- compiled output
- vendored SVG assets needed at runtime
- attribution/licenses documentation
- README

Packaging verification will include smoke tests for:

- built file presence
- asset inclusion
- ESM import resolution
- CommonJS require resolution

## Testing Strategy

Testing will use `vitest` and split coverage across unit, integration, snapshot, and package smoke tests.

### Unit Tests

- validators:
  - size
  - padding
  - squares
  - board array shape
  - theme registration validation
- parsers:
  - FEN normalization
  - PGN normalization
  - board-array normalization
- geometry utilities
- theme resolver behavior
- duplicate theme registration failure
- invalid theme name failure
- incomplete piece map failure
- malformed metadata failure
- highlight normalization and deterministic ordering
- cache key generation and renderer-aware extensibility
- default theme resolution
- style alias resolution
- inline theme precedence over named themes

### Integration Tests

- class API:
  - `loadFEN`
  - `loadPGN`
  - `loadBoard`
  - `toBuffer`
  - `toFile`
- functional API:
  - `renderChess` with each supported input variant
  - ambiguous-input runtime rejection
- highlight lifecycle:
  - `setHighlights` replaces
  - `clearHighlights` clears
  - loading a new position clears highlights
- file output error classification as `IOError`

### Snapshot Tests

Snapshot policy:

- use stable, clearly named fixtures
- keep one fixture per behavior
- prefer golden-file image snapshots over opaque inline snapshots
- store outputs in a dedicated fixtures/snapshots structure

Required rendering coverage:

- FEN rendering
- PGN rendering
- board-array rendering
- highlight rendering
- flipped board rendering
- at least one fixture per built-in style

All snapshot tests must fix relevant variables such as size, colors, theme, and input to keep outputs deterministic and failures easy to review.

### Documentation Drift Prevention

README examples should be kept minimal and validated periodically so documentation remains aligned with implementation behavior.

## Documentation Plan

`README.md` will include:

- installation
- canvas system requirements and troubleshooting
- quick start
- JavaScript usage
- TypeScript usage
- class API reference
- functional API reference
- options reference
- built-in styles
- custom theme registration
- highlight behavior and clearing semantics
- error model
- architecture summary
- migration guide from the original library

### Architecture Summary

The README will include a short architecture section describing the boundaries between:

- core parsing and validation
- themes and registry/resolution
- rendering
- public API orchestration

### Migration Guide

The README will include a migration mapping table with:

- old method or concept
- new equivalent
- behavior differences

Example mappings:

| Old | New | Notes |
| --- | --- | --- |
| `loadArray` | `loadBoard` | renamed for clarity |
| `generateBuffer` | `toBuffer` | async Promise-based API remains |
| `generatePNG` | `toFile` | file writing stays outside rendering internals |

## Asset Provenance

Bundled theme assets require explicit provenance and license documentation.

The repository will include a top-level attribution/licenses document covering:

- bundled theme names
- source provenance
- attribution requirements
- license notes

The README will reference that document.

## Implementation Constraints

- do not copy the original project architecture
- do not base the asset system on PNG files as the source of truth
- do not mix renderer logic with IO
- do not expose internal modules casually through `index.ts`
- do not hardcode built-in theme behavior beyond registration and defaulting

## Recommended Build Sequence

Implementation should proceed in this order:

1. package metadata and build/test tooling
2. public types and error classes
3. validators and normalization utilities
4. canonical board model and parsers
5. theme definitions, validation, registry, and resolver
6. geometry utilities
7. renderer contract, rasterizer, and canvas PNG renderer
8. class and functional APIs
9. tests
10. documentation and examples

This sequence keeps the core deterministic pieces in place before rendering and packaging concerns.
