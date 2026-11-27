"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isThemeId,
  THEME_STORAGE_KEY,
  themeColorFor,
  type ThemeId,
} from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("auto");

  // Recover the theme applied by the pre-paint script (or apply it here if
  // that script was blocked). Keep the picker in sync with the document.
  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (private mode / blocked storage).
    }

    const initial: ThemeId = isThemeId(stored)
      ? stored
      : isThemeId(applied)
        ? applied
        : "auto";

    document.documentElement.dataset.theme = initial;
    setThemeState(initial);
  }, []);

  // Keep the browser chrome color in step with the resolved theme.
  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncThemeColor = () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute(
          "content",
          themeColorFor(theme, darkQuery.matches)
        );
      }
    };

    syncThemeColor();
    darkQuery.addEventListener("change", syncThemeColor);
    return () => darkQuery.removeEventListener("change", syncThemeColor);
  }, [theme]);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Theme still applies for this session.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
