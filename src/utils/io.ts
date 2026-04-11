import { writeFile } from "node:fs/promises";
import { IOError } from "../types/errors";

export async function writeBufferToFile(filePath: string, buffer: Buffer): Promise<void> {
  try {
    await writeFile(filePath, buffer);
  } catch (error) {
    throw new IOError(`Failed to write file: ${filePath}`, { cause: error });
  }
}

export async function writeStringToFile(filePath: string, contents: string): Promise<void> {
  try {
    await writeFile(filePath, contents, "utf8");
  } catch (error) {
    throw new IOError(`Failed to write file: ${filePath}`, { cause: error });
  }
}
