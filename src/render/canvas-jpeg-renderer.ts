import { createCanvas } from "canvas";
import { CanvasPngRenderer } from "./canvas-renderer";

export class CanvasJpegRenderer extends CanvasPngRenderer {
  protected override createOutputBuffer(
    canvas: ReturnType<typeof createCanvas>,
  ): Buffer {
    return canvas.toBuffer("image/jpeg");
  }
}
