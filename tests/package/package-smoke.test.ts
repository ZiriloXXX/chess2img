import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

describe("published package shape", () => {
  it("includes build artifacts and bundled assets", () => {
    expect(existsSync("dist/index.js")).toBe(true);
    expect(existsSync("dist/index.cjs")).toBe(true);
    expect(existsSync("dist/index.d.ts")).toBe(true);
    expect(existsSync("assets/themes/merida/wK.svg")).toBe(true);
    expect(existsSync("README.md")).toBe(true);
    expect(existsSync("ATTRIBUTION.md")).toBe(true);
  });

  it("resolves exports from both esm and cjs entry points", async () => {
    const esmModule = await import(pathToFileURL(resolve("dist/index.js")).href);
    const cjsModule = require("../../dist/index.cjs");

    expect(typeof esmModule.renderChess).toBe("function");
    expect(typeof esmModule.ChessImageGenerator).toBe("function");
    expect(typeof cjsModule.renderChess).toBe("function");
    expect(typeof cjsModule.ChessImageGenerator).toBe("function");
  });
});
