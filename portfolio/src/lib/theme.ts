"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// The inline script in layout.tsx sets data-theme before first paint.
const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

const getServerSnapshot = (): Theme => "light";

/** Fired after the new theme is applied; `exposing` is true while the lamp sweep runs. */
export const THEME_CHANGE = "theme-change";
export type ThemeChangeDetail = { theme: Theme; exposing: boolean };

/** Fired when the exposure transition's animations start, so the lamp can run in step. */
export const EXPOSURE_START = "exposure-start";

function apply(next: Theme, exposing: boolean) {
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent<ThemeChangeDetail>(THEME_CHANGE, { detail: { theme: next, exposing } }));
}

/**
 * Switches the print medium. With view transitions, the new medium is exposed under a UV lamp that
 * sweeps the sheet (CSS reveals the new snapshot; the lamp canvas draws the light and the developing
 * front). Without them, or under reduced motion, the swap is immediate.
 */
export function setTheme(next: Theme) {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || still || root.dataset.vt) {
    apply(next, false);
    return;
  }
  root.dataset.vt = "expose";
  const vt = document.startViewTransition(() => apply(next, true));
  vt.ready.then(
    () => window.dispatchEvent(new Event(EXPOSURE_START)),
    () => {}
  );
  vt.finished.finally(() => {
    delete root.dataset.vt;
  });
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
