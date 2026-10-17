import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  applyTheme,
  readStoredTheme,
  systemPrefersDark,
  ThemeContext,
  THEME_STORAGE_KEY,
  type Theme,
} from "./themeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The pre-paint script in index.html already set the class; read it back so
  // React's initial state matches what the user is actually looking at.
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = readStoredTheme();
    if (stored) return stored;
    return systemPrefersDark() ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const persist = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable - the theme still applies for this session */
    }
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      persist(next);
    },
    [persist]
  );

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
