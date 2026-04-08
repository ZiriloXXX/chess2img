import type { PieceStyle, ThemeDefinition } from "../types/types";
import { ThemeError, ValidationError } from "../types/errors";
import { initializeBuiltInThemes } from "./builtins";
import { getTheme } from "./registry";
import { validateThemeDefinition } from "./validation";

interface ResolveThemeOptions {
  theme?: string | ThemeDefinition;
  style?: PieceStyle;
}

export function resolveTheme({ theme, style }: ResolveThemeOptions): ThemeDefinition {
  initializeBuiltInThemes();

  if (typeof theme === "object" && theme !== null) {
    try {
      return validateThemeDefinition(theme);
    } catch (error) {
      if (error instanceof ThemeError) {
        throw error;
      }

      if (error instanceof ValidationError) {
        throw new ThemeError(error.message, { cause: error });
      }

      throw error;
    }
  }

  const requestedName = typeof theme === "string" ? theme : style ?? "merida";
  const resolvedTheme = getTheme(requestedName);

  if (!resolvedTheme) {
    throw new ThemeError(`Unknown theme: ${requestedName}`);
  }

  return resolvedTheme;
}
