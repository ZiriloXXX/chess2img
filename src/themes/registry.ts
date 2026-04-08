import type { ThemeDefinition } from "../types/types";
import { ThemeError } from "../types/errors";
import { validateThemeDefinition } from "./validation";

const registry = new Map<string, ThemeDefinition>();

export function registerTheme(theme: ThemeDefinition): ThemeDefinition {
  const validatedTheme = validateThemeDefinition(theme);

  if (registry.has(validatedTheme.name)) {
    throw new ThemeError(`Theme "${validatedTheme.name}" is already registered`);
  }

  registry.set(validatedTheme.name, validatedTheme);
  return validatedTheme;
}

export function getTheme(name: string): ThemeDefinition | undefined {
  return registry.get(name.trim().toLowerCase());
}

export function clearThemeRegistryForTesting(): void {
  registry.clear();
}
