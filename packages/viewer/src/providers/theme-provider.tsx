"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useReducer, type ReactNode } from "react";
import type { Theme } from "@der-ort/pano-cloud-viewer-core";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

interface ThemeProviderProps {
  defaultTheme?: Theme;
  storageKey?: string;
  children: ReactNode;
}

export function ThemeProvider({
  defaultTheme = "dark",
  storageKey = "pcv-theme",
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) ?? defaultTheme;
  });

  // Incrementing counter forces a re-render when OS preference changes while
  // theme === "system". Using a counter avoids the React bail-out that occurs
  // when setState is called with the same primitive value ("system" → "system").
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  // Follow the `defaultTheme` prop when an embedding site CHANGES it after mount
  // (controlled theme), so hosts can drive dark/light from their own toggle.
  // Skip the first run so the initial localStorage-persisted choice is respected.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setThemeState(defaultTheme);
  }, [defaultTheme]);

  const resolvedTheme: "dark" | "light" = theme === "system"
    ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  // Listen for system preference changes when theme === "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", forceUpdate);
    return () => mq.removeEventListener("change", forceUpdate);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(storageKey, t);
  };

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
