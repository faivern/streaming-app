import { useState, useEffect } from "react";

export type ThemePreset = "blizzard" | "netflix" | "sleek";

export interface ThemeOption {
  value: ThemePreset;
  label: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: "blizzard", label: "Arctic", description: "Sky blue accents" },
  { value: "netflix", label: "Volcanic", description: "Classic red" },
  { value: "sleek", label: "Astro", description: "Teal & purple" },
];

const STORAGE_KEY = "cinelas-theme";
const DEFAULT_THEME: ThemePreset = "blizzard";

function getStoredTheme(): ThemePreset {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEME_OPTIONS.some((t) => t.value === stored)) {
    return stored as ThemePreset;
  }
  return DEFAULT_THEME;
}

function applyTheme(theme: ThemePreset) {
  document.documentElement.setAttribute("data-preset", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreset>(getStoredTheme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemePreset) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  return { theme, setTheme, options: THEME_OPTIONS };
}
