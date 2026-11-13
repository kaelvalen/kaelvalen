"use client";

import { useSyncExternalStore } from "react";
import { isDay } from "./landscape";

/** The sky: "light" is day, "dark" is night. Left alone, the page follows the sky over Ankara. */
export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// The inline script in layout.tsx sets data-theme before first paint, by the same rule as autoTheme.
const getSnapshot = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const getServerSnapshot = (): Theme => "light";

/** The sky over Ankara right now. */
export const autoTheme = (): Theme => (isDay() ? "light" : "dark");

/** Fired after a new sky is applied, for anything drawn on a canvas. */
export const THEME_CHANGE = "theme-change";

function apply(next: Theme) {
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
  try {
    // Choosing the sky Ankara already has hands the page back to the sky.
    if (next === autoTheme()) localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
  } catch {
    /* storage unavailable: the choice lasts until reload */
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(THEME_CHANGE));
}

/** Switches the sky. With view transitions the new one sweeps in from the left; otherwise it swaps. */
export function setTheme(next: Theme) {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || still || root.dataset.vt) {
    apply(next);
    return;
  }
  root.dataset.vt = "sky";
  document.startViewTransition(() => apply(next)).finished.finally(() => {
    delete root.dataset.vt;
  });
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const auto = useSyncExternalStore(subscribe, autoTheme, getServerSnapshot);
  return { theme, auto, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
