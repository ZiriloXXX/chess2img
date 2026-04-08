import { describe, expect, it } from "vitest";
import { createRasterCacheKey, RasterAssetCache } from "../../src/render/asset-cache";

describe("createRasterCacheKey", () => {
  it("includes theme, piece, size, and backend", () => {
    expect(createRasterCacheKey("merida", "wK", 64, "png-canvas")).toBe(
      "merida:wK:64:png-canvas",
    );
  });
});

describe("RasterAssetCache", () => {
  it("stores and retrieves cached values", () => {
    const cache = new RasterAssetCache<number>();
    cache.set("key", 1);
    expect(cache.get("key")).toBe(1);
  });
});
