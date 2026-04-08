# Chess Image Library Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality TypeScript library for generating chess board PNG images from FEN, PGN, or board arrays with a modern API, bundled vector-based themes, strong typing, validation, tests, and publishable package outputs.

**Architecture:** The implementation is split into four primary layers: core parsing/validation/geometry, theme registration and resolution, PNG rendering through a narrow renderer interface, and a thin API layer for class and functional consumers. The system uses vendored SVG assets as canonical piece sources, rasterizes them only for PNG rendering, and caches piece rasters by theme, piece, and render context.

**Tech Stack:** TypeScript, tsup, vitest, chess.js, canvas, Node.js 18+

**Note:** Commit steps assume the workspace has been initialized as a git repository. If not, initialize git before execution or skip commit checkpoints until repository setup exists.

---

## File Responsibilities

### Package And Build

- Create: `package.json`
  - package metadata, exports map, scripts, dependencies, publish whitelist
- Create: `tsconfig.json`
  - compiler options for Node 18 library output
- Create: `tsup.config.ts`
  - dual ESM/CJS build config and asset copy behavior
- Create: `.gitignore`
  - ignore build and test outputs

### Public Types And Errors

- Create: `src/types/types.ts`
  - public option types, theme types, board types, renderer types
- Create: `src/types/errors.ts`
  - public error classes and error helpers

### Core

- Create: `src/core/board.ts`
  - canonical square ordering, piece keys, normalized board model helpers
- Create: `src/core/validators.ts`
  - runtime validation for options, board arrays, theme names, coordinates
- Create: `src/core/parsers.ts`
  - parse FEN, PGN, and board arrays into `BoardPosition`
- Create: `src/core/highlights.ts`
  - highlight normalization, dedupe, deterministic ordering
- Create: `src/core/geometry.ts`
  - board bounds, square size, pixel coordinate mapping

### Themes

- Create: `src/themes/validation.ts`
  - theme definition validation and completeness checks
- Create: `src/themes/registry.ts`
  - shared theme registry and `registerTheme` support
- Create: `src/themes/resolver.ts`
  - resolve inline theme, theme name, style alias, and default theme
- Create: `src/themes/builtins.ts`
  - built-in theme registration and metadata wiring

### Rendering

- Create: `src/render/renderer.ts`
  - renderer interface and render contract types
- Create: `src/render/asset-cache.ts`
  - vector source cache and raster cache
- Create: `src/render/rasterizer.ts`
  - SVG-to-image rasterization helpers using canvas
- Create: `src/render/canvas-renderer.ts`
  - PNG renderer implementation

### API And Utilities

- Create: `src/utils/io.ts`
  - file output helpers using `fs/promises`
- Create: `src/utils/normalization.ts`
  - small shared normalization helpers
- Create: `src/api/theme-api.ts`
  - public theme registration wrapper
- Create: `src/api/class-api.ts`
  - `ChessImageGenerator`
- Create: `src/api/functional-api.ts`
  - `renderChess`
- Create: `src/index.ts`
  - curated public exports only

### Assets, Tests, Docs, Examples

- Create: `assets/themes/<theme>/<piece>.svg`
  - vendored built-in SVG assets for all 5 themes and 12 pieces each
- Create: `ATTRIBUTION.md`
  - bundled asset provenance and license notes
- Create: `tests/unit/*.test.ts`
  - validators, parsers, geometry, highlights, themes, cache tests
- Create: `tests/integration/*.test.ts`
  - class API, functional API, IO, lifecycle tests
- Create: `tests/snapshots/*.test.ts`
  - golden image snapshot tests
- Create: `tests/fixtures/**/*`
  - FEN, PGN, board inputs, expected render fixtures
- Create: `examples/javascript/basic.js`
  - JS consumer example
- Create: `examples/typescript/basic.ts`
  - TS consumer example
- Create: `README.md`
  - full package documentation

## Phase Overview

### Phase 1: Package foundation

Set up TypeScript, build outputs, package exports, test runner, and publish behavior.

### Phase 2: Public contracts

Define public types, error classes, and internal canonical board model helpers.

### Phase 3: Core parsing and validation

Implement input normalization, discriminated input validation, board parsing, and geometry.

### Phase 4: Theme system

Implement theme validation, registry, built-in theme metadata, resolution, and asset wiring.

### Phase 5: Rendering backend

Implement renderer contract, SVG rasterization, piece caching, and PNG rendering.

### Phase 6: API layer and IO

Implement the class API, functional API, and file output integration.

### Phase 7: Test suite and package smoke tests

Add unit, integration, snapshot, and published-artifact verification.

### Phase 8: Documentation and examples

Write README, migration guide, architecture summary, and examples that match the code.

## Task 1: Package Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsup.config.ts`
- Create: `.gitignore`
- Test: `tests/package/package-smoke.test.ts`

- [ ] **Step 1: Write the failing package smoke test scaffold**

```ts
import { describe, expect, it } from "vitest";

describe("package smoke scaffolding", () => {
  it("has a build script placeholder expectation", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify the test file is detected**

Run: `npx vitest run tests/package/package-smoke.test.ts`
Expected: FAIL because the test runner and project config do not exist yet

- [ ] **Step 3: Add package metadata and tooling**

`package.json`

```json
{
  "name": "chess2img",
  "version": "0.1.0",
  "description": "Modern chess board image rendering for Node.js",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "assets",
    "README.md",
    "ATTRIBUTION.md"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "tsup",
    "clean": "rm -rf dist .vitest-temp",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "canvas": "^3.2.0",
    "chess.js": "^1.4.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "typescript": "^5.8.0",
    "tsup": "^8.5.0",
    "vitest": "^3.2.0"
  }
}
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "examples", "tsup.config.ts"],
  "exclude": ["dist", "node_modules"]
}
```

`tsup.config.ts`

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node18",
  outDir: "dist",
  external: [],
});
```

`.gitignore`

```gitignore
dist
node_modules
.DS_Store
coverage
.vitest-temp
```

- [ ] **Step 4: Run the smoke test again**

Run: `npm test -- tests/package/package-smoke.test.ts`
Expected: PASS

- [ ] **Step 5: Run package-level verification**

Run: `npm run typecheck`
Expected: PASS or no-op success for the initial package scaffold without requiring implementation files yet

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tsup.config.ts .gitignore tests/package/package-smoke.test.ts
git commit -m "chore: initialize package tooling"
```

## Task 2: Public Types And Error Classes

**Files:**
- Create: `src/types/types.ts`
- Create: `src/types/errors.ts`
- Create: `src/index.ts`
- Test: `tests/unit/types-and-errors.test.ts`

- [ ] **Step 1: Write the failing type and error tests**

```ts
import { describe, expect, it } from "vitest";
import {
  IOError,
  ParseError,
  RenderError,
  ThemeError,
  ValidationError,
} from "../../src/types/errors";

describe("public error classes", () => {
  it("preserves class identity", () => {
    expect(new ValidationError("invalid")).toBeInstanceOf(ValidationError);
    expect(new ParseError("invalid")).toBeInstanceOf(ParseError);
    expect(new ThemeError("invalid")).toBeInstanceOf(ThemeError);
    expect(new RenderError("invalid")).toBeInstanceOf(RenderError);
    expect(new IOError("invalid")).toBeInstanceOf(IOError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/types-and-errors.test.ts`
Expected: FAIL because the type and error modules do not exist

- [ ] **Step 3: Implement public types and errors**

`src/types/errors.ts`

```ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class ThemeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeError";
  }
}

export class RenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RenderError";
  }
}

export class IOError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "IOError";
    if (options?.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        value: options.cause,
        enumerable: false,
        configurable: true,
      });
    }
  }
}
```

`src/types/types.ts`

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

export type PieceKey =
  | "wK" | "wQ" | "wR" | "wB" | "wN" | "wP"
  | "bK" | "bQ" | "bR" | "bB" | "bN" | "bP";

export interface ThemeDefinition {
  name: string;
  displayName: string;
  license: string;
  attribution: string;
  pieces: Record<PieceKey, SvgAssetSource>;
}

export interface SvgAssetSource {
  kind: "svg";
  source: string;
}
```

`src/index.ts`

```ts
export * from "./types/errors";
export * from "./types/types";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/types-and-errors.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/types.ts src/types/errors.ts src/index.ts tests/unit/types-and-errors.test.ts
git commit -m "feat: add public types and error classes"
```

## Task 3: Canonical Board Model, Validation, And Highlight Normalization

**Files:**
- Create: `src/core/board.ts`
- Create: `src/core/validators.ts`
- Create: `src/core/highlights.ts`
- Test: `tests/unit/validators.test.ts`
- Test: `tests/unit/highlights.test.ts`

- [ ] **Step 1: Write the failing validator and highlight tests**

```ts
import { describe, expect, it } from "vitest";
import { normalizeHighlights } from "../../src/core/highlights";
import { validatePadding, validateSquare } from "../../src/core/validators";
import { ValidationError } from "../../src/types/errors";

describe("validateSquare", () => {
  it("accepts valid coordinates", () => {
    expect(validateSquare("e4")).toBe("e4");
  });

  it("rejects invalid coordinates", () => {
    expect(() => validateSquare("z9")).toThrow(ValidationError);
  });
});

describe("normalizeHighlights", () => {
  it("deduplicates and sorts squares deterministically", () => {
    expect(normalizeHighlights(["E4", "d5", "e4"])).toEqual(["d5", "e4"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/validators.test.ts tests/unit/highlights.test.ts`
Expected: FAIL because core modules do not exist

- [ ] **Step 3: Implement canonical board helpers and validators**

`src/core/board.ts`

```ts
import type { PieceKey, Square } from "../types/types";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

export const SQUARES: Square[] = RANKS.flatMap((rank) =>
  FILES.map((file) => `${file}${rank}`),
);

export interface BoardPosition {
  squares: Record<Square, PieceKey | null>;
}

export function createEmptyBoardPosition(): BoardPosition {
  return {
    squares: Object.fromEntries(SQUARES.map((square) => [square, null])) as Record<
      Square,
      PieceKey | null
    >,
  };
}
```

`src/core/validators.ts`

```ts
import type { Padding, Square } from "../types/types";
import { ValidationError } from "../types/errors";

const SQUARE_PATTERN = /^[a-h][1-8]$/;

export function validateSquare(square: string): Square {
  const normalized = square.trim().toLowerCase();
  if (!SQUARE_PATTERN.test(normalized)) {
    throw new ValidationError(`Invalid square: ${square}`);
  }
  return normalized;
}

export function validatePadding(padding: number[]): Padding {
  if (padding.length !== 4 || padding.some((value) => value < 0)) {
    throw new ValidationError("Padding must be a 4-item array of non-negative numbers");
  }
  return [padding[0], padding[1], padding[2], padding[3]];
}
```

`src/core/highlights.ts`

```ts
import type { Square } from "../types/types";
import { validateSquare } from "./validators";

export function normalizeHighlights(input: string[]): Square[] {
  return [...new Set(input.map(validateSquare))].sort();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/validators.test.ts tests/unit/highlights.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/board.ts src/core/validators.ts src/core/highlights.ts tests/unit/validators.test.ts tests/unit/highlights.test.ts
git commit -m "feat: add board model and validation utilities"
```

## Task 4: Parser Layer With Discriminated Input Validation

**Files:**
- Create: `src/core/parsers.ts`
- Modify: `src/core/validators.ts`
- Test: `tests/unit/parsers.test.ts`
- Test: `tests/unit/render-inputs.test.ts`

- [ ] **Step 1: Write the failing parser tests**

```ts
import { describe, expect, it } from "vitest";
import { parseFEN, parseBoardArray } from "../../src/core/parsers";
import { ParseError, ValidationError } from "../../src/types/errors";

describe("parseFEN", () => {
  it("creates a normalized board position", () => {
    const board = parseFEN("8/8/8/8/8/8/8/4K3 w - - 0 1");
    expect(board.squares.e1).toBe("wK");
  });

  it("rejects malformed fen", () => {
    expect(() => parseFEN("invalid")).toThrow(ParseError);
  });
});

describe("parseBoardArray", () => {
  it("rejects invalid board dimensions", () => {
    expect(() => parseBoardArray([["K"]])).toThrow(ValidationError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/parsers.test.ts tests/unit/render-inputs.test.ts`
Expected: FAIL because parser functions and discriminated input validation are not implemented

- [ ] **Step 3: Implement board parsing and input-source validation**

`src/core/parsers.ts`

```ts
import { Chess } from "chess.js";
import type { BoardArray, PieceKey } from "../types/types";
import { ParseError, ValidationError } from "../types/errors";
import { createEmptyBoardPosition, FILES } from "./board";

const PIECE_MAP: Record<string, PieceKey> = {
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

export function parseFEN(fen: string) {
  const chess = new Chess();
  if (!chess.load(fen)) {
    throw new ParseError("Invalid FEN");
  }
  return parseBoardArray(
    chess.board().map((rank) => rank.map((piece) => (piece ? `${piece.color === "w" ? piece.type.toUpperCase() : piece.type}` : null))),
  );
}

export function parsePGN(pgn: string) {
  const chess = new Chess();
  if (!chess.loadPgn(pgn)) {
    throw new ParseError("Invalid PGN");
  }
  return parseBoardArray(
    chess.board().map((rank) => rank.map((piece) => (piece ? `${piece.color === "w" ? piece.type.toUpperCase() : piece.type}` : null))),
  );
}

export function parseBoardArray(board: BoardArray) {
  if (board.length !== 8 || board.some((rank) => rank.length !== 8)) {
    throw new ValidationError("Board array must be 8x8");
  }

  const position = createEmptyBoardPosition();

  board.forEach((rank, rankIndex) => {
    rank.forEach((cell, fileIndex) => {
      if (cell === null || cell === " " || cell === "") {
        return;
      }
      const piece = PIECE_MAP[cell];
      if (!piece) {
        throw new ValidationError(`Invalid board piece: ${cell}`);
      }
      const square = `${FILES[fileIndex]}${8 - rankIndex}` as keyof typeof position.squares;
      position.squares[square] = piece;
    });
  });

  return position;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/parsers.test.ts tests/unit/render-inputs.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/parsers.ts src/core/validators.ts tests/unit/parsers.test.ts tests/unit/render-inputs.test.ts
git commit -m "feat: add parser layer and input validation"
```

## Task 5: Geometry Utilities

**Files:**
- Create: `src/core/geometry.ts`
- Test: `tests/unit/geometry.test.ts`

- [ ] **Step 1: Write the failing geometry test**

```ts
import { describe, expect, it } from "vitest";
import { createBoardGeometry } from "../../src/core/geometry";

describe("createBoardGeometry", () => {
  it("computes square coordinates from size and padding", () => {
    const geometry = createBoardGeometry({ size: 400, padding: [20, 20, 20, 20] });
    expect(geometry.squareSize).toBe(50);
    expect(geometry.squares.a8).toEqual({ x: 20, y: 20, size: 50 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/geometry.test.ts`
Expected: FAIL because geometry utilities do not exist

- [ ] **Step 3: Implement geometry computation**

`src/core/geometry.ts`

```ts
import { SQUARES } from "./board";

interface GeometryOptions {
  size: number;
  padding: [number, number, number, number];
}

export function createBoardGeometry({ size, padding }: GeometryOptions) {
  const [top, right, bottom, left] = padding;
  const squareSize = size / 8;
  const imageWidth = left + size + right;
  const imageHeight = top + size + bottom;

  const squares = Object.fromEntries(
    SQUARES.map((square, index) => {
      const file = index % 8;
      const rank = Math.floor(index / 8);
      return [
        square,
        {
          x: left + file * squareSize,
          y: top + rank * squareSize,
          size: squareSize,
        },
      ];
    }),
  );

  return {
    boardX: left,
    boardY: top,
    boardSize: size,
    imageWidth,
    imageHeight,
    squareSize,
    squares,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/geometry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/geometry.ts tests/unit/geometry.test.ts
git commit -m "feat: add board geometry utilities"
```

## Task 6: Theme Validation, Registry, And Resolution

**Files:**
- Create: `src/themes/validation.ts`
- Create: `src/themes/registry.ts`
- Create: `src/themes/resolver.ts`
- Create: `src/themes/builtins.ts`
- Test: `tests/unit/themes.test.ts`

- [ ] **Step 1: Write the failing theme tests**

```ts
import { describe, expect, it } from "vitest";
import { registerTheme } from "../../src/themes/registry";
import { resolveTheme } from "../../src/themes/resolver";
import { ThemeError, ValidationError } from "../../src/types/errors";

describe("theme registry", () => {
  it("rejects duplicate names", () => {
    const theme = {
      name: "custom",
      displayName: "Custom",
      license: "MIT",
      attribution: "Test",
      pieces: {} as never,
    };

    expect(() => registerTheme(theme)).toThrow();
  });
});

describe("theme resolution", () => {
  it("defaults to merida", () => {
    expect(resolveTheme({}).name).toBe("merida");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/themes.test.ts`
Expected: FAIL because the theme system does not exist

- [ ] **Step 3: Implement theme validation and registry**

`src/themes/validation.ts`

```ts
import type { PieceKey, ThemeDefinition } from "../types/types";
import { ThemeError, ValidationError } from "../types/errors";

const REQUIRED_PIECES: PieceKey[] = [
  "wK", "wQ", "wR", "wB", "wN", "wP",
  "bK", "bQ", "bR", "bB", "bN", "bP",
];

const THEME_NAME_PATTERN = /^[a-z0-9-]+$/;

export function validateThemeDefinition(theme: ThemeDefinition): ThemeDefinition {
  if (!THEME_NAME_PATTERN.test(theme.name)) {
    throw new ValidationError(`Invalid theme name: ${theme.name}`);
  }

  for (const piece of REQUIRED_PIECES) {
    if (!theme.pieces[piece] || theme.pieces[piece].kind !== "svg") {
      throw new ThemeError(`Theme "${theme.name}" is missing piece asset ${piece}`);
    }
  }

  return {
    ...theme,
    name: theme.name.toLowerCase(),
  };
}
```

`src/themes/registry.ts`

```ts
import type { ThemeDefinition } from "../types/types";
import { ThemeError } from "../types/errors";
import { validateThemeDefinition } from "./validation";

const registry = new Map<string, ThemeDefinition>();

export function registerTheme(theme: ThemeDefinition): ThemeDefinition {
  const validated = validateThemeDefinition(theme);
  if (registry.has(validated.name)) {
    throw new ThemeError(`Theme "${validated.name}" is already registered`);
  }
  registry.set(validated.name, validated);
  return validated;
}

export function getTheme(name: string): ThemeDefinition | undefined {
  return registry.get(name.toLowerCase());
}
```

`src/themes/resolver.ts`

```ts
import type { PieceStyle, ThemeDefinition } from "../types/types";
import { ThemeError } from "../types/errors";
import { getTheme } from "./registry";

interface ResolveThemeInput {
  theme?: string | ThemeDefinition;
  style?: PieceStyle;
}

export function resolveTheme(input: ResolveThemeInput): ThemeDefinition {
  if (typeof input.theme === "object" && input.theme) {
    return input.theme;
  }

  const requestedName = typeof input.theme === "string" ? input.theme : input.style ?? "merida";
  const resolved = getTheme(requestedName);

  if (!resolved) {
    throw new ThemeError(`Unknown theme: ${requestedName}`);
  }

  return resolved;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/themes.test.ts`
Expected: PASS after built-ins are registered

- [ ] **Step 5: Commit**

```bash
git add src/themes/validation.ts src/themes/registry.ts src/themes/resolver.ts src/themes/builtins.ts tests/unit/themes.test.ts
git commit -m "feat: add theme registry and resolution"
```

## Task 7: Built-In Assets And Attribution

**Files:**
- Create: `assets/themes/<theme>/<piece>.svg`
- Create: `src/themes/builtins.ts`
- Create: `ATTRIBUTION.md`
- Test: `tests/unit/builtins.test.ts`

- [ ] **Step 1: Write the failing built-in asset test**

```ts
import { describe, expect, it } from "vitest";
import { builtInThemeNames, initializeBuiltInThemes } from "../../src/themes/builtins";
import { getTheme } from "../../src/themes/registry";

describe("built-in themes", () => {
  it("registers all bundled themes", () => {
    initializeBuiltInThemes();
    expect(builtInThemeNames).toHaveLength(5);
    expect(getTheme("merida")?.name).toBe("merida");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/builtins.test.ts`
Expected: FAIL because assets and built-in theme metadata do not exist

- [ ] **Step 3: Vendor assets and wire built-in registration**

`src/themes/builtins.ts`

```ts
import { join } from "node:path";
import type { PieceKey, ThemeDefinition } from "../types/types";
import { registerTheme } from "./registry";

export const builtInThemeNames = ["merida", "alpha", "cburnett", "cheq", "leipzig"] as const;

const PIECES: PieceKey[] = [
  "wK", "wQ", "wR", "wB", "wN", "wP",
  "bK", "bQ", "bR", "bB", "bN", "bP",
];

function createBuiltInTheme(name: string): ThemeDefinition {
  return {
    name,
    displayName: name,
    license: "See ATTRIBUTION.md",
    attribution: "Bundled theme asset attribution listed in ATTRIBUTION.md",
    pieces: Object.fromEntries(
      PIECES.map((piece) => [
        piece,
        {
          kind: "svg",
          source: join(process.cwd(), "assets", "themes", name, `${piece}.svg`),
        },
      ]),
    ) as ThemeDefinition["pieces"],
  };
}

export function initializeBuiltInThemes(): void {
  for (const name of builtInThemeNames) {
    try {
      registerTheme(createBuiltInTheme(name));
    } catch {
      // Ignore duplicate init during tests and repeated imports.
    }
  }
}
```

`ATTRIBUTION.md`

```md
# Bundled Theme Attribution

This package vendors built-in SVG chess piece themes for `merida`, `alpha`, `cburnett`, `cheq`, and `leipzig`.

Each bundled theme must include:

- original source provenance
- license notes
- attribution requirements
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/builtins.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add assets src/themes/builtins.ts ATTRIBUTION.md tests/unit/builtins.test.ts
git commit -m "feat: add bundled theme assets and attribution"
```

## Task 8: Renderer Contract, Rasterizer, And Cache

**Files:**
- Create: `src/render/renderer.ts`
- Create: `src/render/asset-cache.ts`
- Create: `src/render/rasterizer.ts`
- Test: `tests/unit/asset-cache.test.ts`

- [ ] **Step 1: Write the failing renderer/cache tests**

```ts
import { describe, expect, it } from "vitest";
import { createRasterCacheKey } from "../../src/render/asset-cache";

describe("createRasterCacheKey", () => {
  it("includes theme, piece, size, and backend", () => {
    expect(createRasterCacheKey("merida", "wK", 64, "png-canvas")).toBe("merida:wK:64:png-canvas");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/asset-cache.test.ts`
Expected: FAIL because render modules do not exist

- [ ] **Step 3: Implement renderer contract and cache**

`src/render/renderer.ts`

```ts
import type { BoardPosition, } from "../core/board";
import type { ThemeDefinition } from "../types/types";

export interface RenderRequest {
  board: BoardPosition;
  theme: ThemeDefinition;
  highlights: string[];
  size: number;
  padding: [number, number, number, number];
}

export interface Renderer<TOutput> {
  render(request: RenderRequest): Promise<TOutput>;
}
```

`src/render/asset-cache.ts`

```ts
export function createRasterCacheKey(
  themeName: string,
  pieceKey: string,
  squareSize: number,
  backend: string,
): string {
  return `${themeName}:${pieceKey}:${squareSize}:${backend}`;
}

export class RasterCache<T> {
  private readonly cache = new Map<string, T>();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/asset-cache.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/render/renderer.ts src/render/asset-cache.ts src/render/rasterizer.ts tests/unit/asset-cache.test.ts
git commit -m "feat: add renderer contract and caching primitives"
```

## Task 9: Canvas PNG Renderer

**Files:**
- Create: `src/render/canvas-renderer.ts`
- Modify: `src/render/rasterizer.ts`
- Test: `tests/integration/canvas-renderer.test.ts`

- [ ] **Step 1: Write the failing renderer integration test**

```ts
import { describe, expect, it } from "vitest";
import { CanvasPngRenderer } from "../../src/render/canvas-renderer";
import { createEmptyBoardPosition } from "../../src/core/board";
import { getTheme } from "../../src/themes/registry";
import { initializeBuiltInThemes } from "../../src/themes/builtins";

describe("CanvasPngRenderer", () => {
  it("renders a PNG buffer", async () => {
    initializeBuiltInThemes();
    const renderer = new CanvasPngRenderer();
    const buffer = await renderer.render({
      board: createEmptyBoardPosition(),
      theme: getTheme("merida")!,
      highlights: [],
      size: 400,
      padding: [0, 0, 0, 0],
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/canvas-renderer.test.ts`
Expected: FAIL because the PNG renderer is not implemented

- [ ] **Step 3: Implement the canvas renderer**

`src/render/canvas-renderer.ts`

```ts
import { createCanvas } from "canvas";
import { createBoardGeometry } from "../core/geometry";
import type { Renderer } from "./renderer";

export class CanvasPngRenderer implements Renderer<Buffer> {
  async render(request: {
    board: { squares: Record<string, string | null> };
    theme: { name: string };
    highlights: string[];
    size: number;
    padding: [number, number, number, number];
  }): Promise<Buffer> {
    const geometry = createBoardGeometry({
      size: request.size,
      padding: request.padding,
    });

    const canvas = createCanvas(geometry.imageWidth, geometry.imageHeight);
    const context = canvas.getContext("2d");

    for (const [square, cell] of Object.entries(geometry.squares)) {
      const fileIndex = square.charCodeAt(0) - 97;
      const rankIndex = 8 - Number(square[1]);
      context.fillStyle = (fileIndex + rankIndex) % 2 === 0 ? "#f0d9b5" : "#b58863";
      context.fillRect(cell.x, cell.y, cell.size, cell.size);
    }

    return canvas.toBuffer("image/png");
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/integration/canvas-renderer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/render/canvas-renderer.ts src/render/rasterizer.ts tests/integration/canvas-renderer.test.ts
git commit -m "feat: add canvas png renderer"
```

## Task 10: API Layer And IO

**Files:**
- Create: `src/utils/io.ts`
- Create: `src/api/theme-api.ts`
- Create: `src/api/class-api.ts`
- Create: `src/api/functional-api.ts`
- Modify: `src/index.ts`
- Test: `tests/integration/api.test.ts`

- [ ] **Step 1: Write the failing API integration tests**

```ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ChessImageGenerator, renderChess } from "../../src";

describe("public API", () => {
  it("renders from FEN using the functional API", async () => {
    const buffer = await renderChess({
      fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
      size: 400,
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("writes a file from the class API", async () => {
    const generator = new ChessImageGenerator({ size: 400 });
    await generator.loadFEN("8/8/8/8/8/8/8/4K3 w - - 0 1");

    const dir = await mkdtemp(join(tmpdir(), "chess2img-"));
    const filePath = join(dir, "board.png");
    await generator.toFile(filePath);

    const file = await readFile(filePath);
    expect(file.byteLength).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/api.test.ts`
Expected: FAIL because the public API is not implemented

- [ ] **Step 3: Implement IO and public API orchestration**

`src/utils/io.ts`

```ts
import { writeFile } from "node:fs/promises";
import { IOError } from "../types/errors";

export async function writeBufferToFile(filePath: string, buffer: Buffer): Promise<void> {
  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    throw new IOError(`Failed to write file: ${filePath}`, { cause: error });
  }
}
```

`src/api/theme-api.ts`

```ts
export { registerTheme } from "../themes/registry";
```

`src/api/functional-api.ts`

```ts
import { parseBoardArray, parseFEN, parsePGN } from "../core/parsers";
import { normalizeHighlights } from "../core/highlights";
import { CanvasPngRenderer } from "../render/canvas-renderer";
import { resolveTheme } from "../themes/resolver";
import { ValidationError } from "../types/errors";

export async function renderChess(input: Record<string, unknown>): Promise<Buffer> {
  const provided = ["fen", "pgn", "board"].filter((key) => input[key] !== undefined);
  if (provided.length !== 1) {
    throw new ValidationError("Exactly one of fen, pgn, or board must be provided");
  }

  const board =
    input.fen !== undefined
      ? parseFEN(String(input.fen))
      : input.pgn !== undefined
        ? parsePGN(String(input.pgn))
        : parseBoardArray(input.board as never);

  const renderer = new CanvasPngRenderer();

  return renderer.render({
    board,
    theme: resolveTheme({ theme: input.theme as never, style: input.style as never }),
    highlights: normalizeHighlights((input.highlightSquares as string[] | undefined) ?? []),
    size: Number(input.size ?? 480),
    padding: (input.padding as [number, number, number, number] | undefined) ?? [0, 0, 0, 0],
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/integration/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/io.ts src/api/theme-api.ts src/api/class-api.ts src/api/functional-api.ts src/index.ts tests/integration/api.test.ts
git commit -m "feat: add public api layer"
```

## Task 11: Snapshot Coverage And Lifecycle Semantics

**Files:**
- Create: `tests/snapshots/fen-render.test.ts`
- Create: `tests/snapshots/pgn-render.test.ts`
- Create: `tests/snapshots/board-render.test.ts`
- Create: `tests/integration/highlight-lifecycle.test.ts`
- Create: `tests/fixtures/**/*`

- [ ] **Step 1: Write the failing lifecycle and snapshot tests**

```ts
import { describe, expect, it } from "vitest";
import { ChessImageGenerator } from "../../src";

describe("highlight lifecycle", () => {
  it("replaces highlights and clears them on load", async () => {
    const generator = new ChessImageGenerator({ size: 400 });
    await generator.loadFEN("8/8/8/8/8/8/8/4K3 w - - 0 1");
    generator.setHighlights(["e4"]);
    generator.setHighlights(["d5"]);
    await generator.loadFEN("8/8/8/8/8/8/8/4K3 w - - 0 1");
    const buffer = await generator.toBuffer();
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/integration/highlight-lifecycle.test.ts tests/snapshots/fen-render.test.ts`
Expected: FAIL because snapshot fixtures and complete lifecycle behavior are not implemented

- [ ] **Step 3: Add golden-file snapshot coverage**

```text
tests/
  fixtures/
    fen/
      simple-white-king.txt
    pgn/
      short-game.pgn
    board/
      initial-position.json
  snapshots/
    fen-render.test.ts
    pgn-render.test.ts
    board-render.test.ts
    __golden__/
      fen-simple-white-king-merida.png
      pgn-short-game-merida.png
      board-initial-alpha.png
```

- [ ] **Step 4: Run targeted snapshot tests**

Run: `npm test -- tests/snapshots/fen-render.test.ts tests/snapshots/pgn-render.test.ts tests/snapshots/board-render.test.ts`
Expected: PASS with deterministic outputs

- [ ] **Step 5: Commit**

```bash
git add tests/integration/highlight-lifecycle.test.ts tests/snapshots tests/fixtures
git commit -m "test: add lifecycle and snapshot coverage"
```

## Task 12: Documentation, Examples, And Published-Artifact Smoke Tests

**Files:**
- Create: `README.md`
- Create: `examples/javascript/basic.js`
- Create: `examples/typescript/basic.ts`
- Modify: `tests/package/package-smoke.test.ts`

- [ ] **Step 1: Write the failing package artifact assertions**

```ts
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("built artifacts", () => {
  it("includes the primary package files", () => {
    expect(existsSync("dist/index.js")).toBe(true);
    expect(existsSync("dist/index.cjs")).toBe(true);
    expect(existsSync("dist/index.d.ts")).toBe(true);
    expect(existsSync("assets/themes/merida/wK.svg")).toBe(true);
  });
});
```

- [ ] **Step 2: Run smoke test to verify it fails before docs/examples/build are complete**

Run: `npm test -- tests/package/package-smoke.test.ts`
Expected: FAIL if the package has not yet been fully built

- [ ] **Step 3: Write docs and examples**

`README.md`

```md
# chess2img

Modern chess board image rendering for Node.js.

## Installation

```bash
npm install chess2img
```

## Quick Start

```ts
import { renderChess } from "chess2img";

const buffer = await renderChess({
  fen: "8/8/8/8/8/8/8/4K3 w - - 0 1",
  size: 480,
});
```

## Migration From chess-image-generator

| Old | New | Notes |
| --- | --- | --- |
| `loadArray` | `loadBoard` | clearer naming |
| `generateBuffer` | `toBuffer` | same async output role |
| `generatePNG` | `toFile` | IO separated from rendering |
```

- [ ] **Step 4: Run the full verification suite**

Run: `npm run typecheck`
Expected: PASS

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md examples tests/package/package-smoke.test.ts
git commit -m "docs: add examples and release documentation"
```

## Module Dependency Order

Build modules in this order:

1. package config and test harness
2. public types and errors
3. board model, validators, and highlight normalization
4. parsers and discriminated input checks
5. geometry utilities
6. theme validation, registry, and resolution
7. built-in theme metadata and asset wiring
8. renderer contract, rasterizer, and cache
9. canvas PNG renderer
10. API layer and IO
11. snapshot and lifecycle tests
12. docs, examples, and package smoke tests

Reasoning:

- core types and validation must exist before parsers and themes can be implemented safely
- themes and geometry must exist before rendering can be completed
- rendering must exist before public API integration and snapshot tests
- package smoke tests and docs should validate the final published shape rather than an intermediate state

## Risk Areas And Edge Cases

### Highest-Risk Areas

- `canvas` install/runtime compatibility on different systems
- deterministic PNG snapshot output across environments
- robust SVG rasterization and caching without leaking renderer-specific assumptions into shared code
- resolving vendored asset paths correctly in both source and published package layouts

### Parsing And Validation Edge Cases

- malformed FEN and PGN should throw `ParseError`, not `ValidationError`
- board arrays must reject invalid dimensions and invalid piece symbols consistently
- functional API must reject ambiguous inputs where more than one of `fen`, `pgn`, or `board` is provided

### Theme Edge Cases

- duplicate theme names must fail clearly
- invalid or mixed-case theme names must normalize predictably
- custom themes must contain all 12 canonical pieces
- inline theme definitions must take precedence without mutating the shared registry

### Highlight And State Edge Cases

- `setHighlights` must replace, not merge
- `clearHighlights` must empty the set deterministically
- loading a new position must clear highlights while preserving render defaults
- highlight normalization must validate, deduplicate, and order squares deterministically

### Rendering Edge Cases

- flipped board orientation must affect square traversal and highlight placement consistently
- piece raster cache keys must remain safe if future renderer context expands
- missing or unreadable SVG assets must surface as `ThemeError` or `RenderError` in the correct stage

### Packaging Edge Cases

- build output must include assets and attribution docs
- `exports` must resolve from both `import` and `require`
- README examples should remain aligned with the actual public API and package name

## Approval Gate

Do not start implementation until this plan is approved.
