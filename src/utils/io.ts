import { writeFile } from "node:fs/promises";
import { IOError } from "../types/errors";

export async function writeBufferToFile(filePath: string, buffer: Buffer): Promise<void> {
  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    throw new IOError(`Failed to write file: ${filePath}`, { cause: error });
  }
}
