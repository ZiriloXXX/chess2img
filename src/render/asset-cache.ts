export function createRasterCacheKey(
  themeName: string,
  pieceKey: string,
  squareSize: number,
  backend: string,
): string {
  return `${themeName}:${pieceKey}:${squareSize}:${backend}`;
}

export class RasterAssetCache<T> {
  private readonly cache = new Map<string, T>();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }
}

export class SourceAssetCache<T> {
  private readonly cache = new Map<string, T>();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }
}
