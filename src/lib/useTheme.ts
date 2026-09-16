import { useCallback, useEffect, useState } from "react";
import { usePrefersDark } from "./usePrefersDark";

export type Theme = "system" | "light" | "dark";

const KEY = "hometowns:theme";

function readStored(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/**
 * Theme preference: follows prefers-color-scheme unless the user picks one.
 * The choice is applied as data-theme on <html> so CSS tokens switch, and
 * remembered in localStorage.
 */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; dark: boolean } {
  const [theme, setThemeState] = useState<Theme>(readStored);
  const prefersDark = usePrefersDark();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      if (t === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { theme, setTheme, dark: theme === "dark" || (theme === "system" && prefersDark) };
}
