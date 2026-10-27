"use client";

import { useEffect } from "react";
import { ExposureLamp, cachedTile, cubicBezier, paperTile } from "@/lib/paper-gl";
import { EXPOSURE_START, THEME_CHANGE, type Theme, type ThemeChangeDetail } from "@/lib/theme";

const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function showPaper(theme: Theme) {
  const url = cachedTile(theme);
  document.documentElement.style.setProperty("--paper-tex", url ? `url(${url})` : "none");
}

/**
 * The medium: paper fibre under every sheet and the lamp that exposes a new one. Also defines the
 * ink-bleed filter that plotted figures use.
 */
export default function PaperLayer() {
  useEffect(() => {
    const lamp = new ExposureLamp();
    const ease = cubicBezier(0.5, 0, 0.2, 1);
    let safety: ReturnType<typeof setTimeout> | undefined;
    let alive = true;

    // The current medium first, the other one when the page is idle.
    const theme = currentTheme();
    paperTile(theme).then(() => alive && showPaper(currentTheme()));
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
    idle(() => paperTile(theme === "dark" ? "light" : "dark"));

    const onTheme = (e: Event) => {
      const { theme: next, exposing } = (e as CustomEvent<ThemeChangeDetail>).detail;
      showPaper(next);
      if (!cachedTile(next)) paperTile(next).then(() => alive && showPaper(currentTheme()));
      if (exposing) {
        const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper");
        lamp.mount(paper);
        clearTimeout(safety);
        safety = setTimeout(() => lamp.unmount(), 3000);
      }
    };
    const onExpose = () => {
      // The minifier may rewrite 1100ms as 1.1s, so read the unit.
      const v = getComputedStyle(document.documentElement).getPropertyValue("--dur-expose").trim();
      const ms = parseFloat(v) * (v.endsWith("ms") ? 1 : v.endsWith("s") ? 1000 : 1) || 1100;
      lamp.run(ms, ease);
    };

    window.addEventListener(THEME_CHANGE, onTheme);
    window.addEventListener(EXPOSURE_START, onExpose);
    return () => {
      alive = false;
      clearTimeout(safety);
      lamp.unmount();
      window.removeEventListener(THEME_CHANGE, onTheme);
      window.removeEventListener(EXPOSURE_START, onExpose);
    };
  }, []);

  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      <filter id="ink-bleed" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="fibre" />
        <feDisplacementMap in="SourceGraphic" in2="fibre" scale="1.15" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
