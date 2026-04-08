import { describe, expect, it } from "vitest";
import {
  IOError,
  ParseError,
  RenderError,
  ThemeError,
  ValidationError,
} from "../../src/types/errors";

describe("public error classes", () => {
  it("preserve class identity", () => {
    expect(new ValidationError("invalid")).toBeInstanceOf(ValidationError);
    expect(new ParseError("invalid")).toBeInstanceOf(ParseError);
    expect(new ThemeError("invalid")).toBeInstanceOf(ThemeError);
    expect(new RenderError("invalid")).toBeInstanceOf(RenderError);
    expect(new IOError("invalid")).toBeInstanceOf(IOError);
  });
});
