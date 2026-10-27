"use client";

import { useSyncExternalStore } from "react";
import { SHEET_IDS, sheetFromPath, sheetPath, type SheetId } from "./sheets";

/*
 * One page, five addresses. Every sheet lives on the same document, but each has its own path:
 * scrolling rewrites the address to the sheet in view, and following a sheet link turns the sheet
 * (a view transition) instead of scrolling the reader through everything in between.
 */

let active: SheetId = "top";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const useActiveSheet = () => useSyncExternalStore(subscribe, () => active, () => "top" as SheetId);

function setActive(next: SheetId) {
  if (next === active) return;
  active = next;
  listeners.forEach((l) => l());
}

// While a sheet turn is in flight, the spy must not rewrite the address it just set.
let turning = false;
// Document titles per sheet, in the current language; set by the spy.
let titles: Record<SheetId, string> | null = null;
// The spy's reader. A turn calls it when it ends, since scrolls during the turn were ignored.
let reread: (() => void) | null = null;

function jump(id: SheetId) {
  if (id === "top") window.scrollTo({ top: 0, behavior: "instant" });
  else document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
}

/** Turns to a sheet: updates the address, then shows the sheet with a sheet-turn transition. */
export function goToSheet(id: SheetId, { push = true }: { push?: boolean } = {}) {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const apply = () => {
    jump(id);
    if (push && location.pathname !== sheetPath(id)) history.pushState(null, "", sheetPath(id));
    if (titles) document.title = titles[id];
    setActive(id);
  };
  turning = true;
  const done = () => {
    turning = false;
    delete root.dataset.vt;
    reread?.();
  };
  if (!document.startViewTransition || still || root.dataset.vt) {
    apply();
    requestAnimationFrame(done);
    return;
  }
  root.dataset.vt = "sheet";
  document.startViewTransition(apply).finished.finally(done);
}

/** Link handler for sheet links: plain clicks turn the sheet, modified clicks behave as links. */
export function onSheetLink(id: SheetId) {
  return (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    goToSheet(id);
  };
}

let arrived = false;

/**
 * Starts the spy. On load, a sheet path scrolls to its sheet; afterwards the sheet whose top has
 * passed 35% of the viewport is the active one, and the address follows it without adding history.
 */
export function startSheetSpy(sheetTitles: Record<SheetId, string>) {
  titles = sheetTitles;
  const initial = sheetFromPath(location.pathname);
  // Only the first start follows the address; a restart (new language) keeps the reader in place.
  // Fonts and late layout move the sheet after the first jump, so it is re-aimed as they land,
  // until the reader takes over.
  if (!arrived && initial !== "top" && !location.hash) {
    jump(initial);
    let mine = true;
    const release = () => {
      mine = false;
    };
    const opts = { once: true, passive: true } as const;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.addEventListener(t, release, opts));
    // Any change in the document's height (fonts, hydration, measured figures) re-aims the sheet.
    const ro = new ResizeObserver(() => mine && jump(initial));
    ro.observe(document.body);
    setTimeout(() => {
      release();
      ro.disconnect();
    }, 4000);
  }
  arrived = true;
  setActive(initial);
  document.title = sheetTitles[initial];

  let frame = 0;
  const read = () => {
    frame = 0;
    const line = window.innerHeight * 0.35;
    let current: SheetId = "top";
    for (const id of SHEET_IDS) {
      const el = document.querySelector<HTMLElement>(`[data-sheet-id="${id}"]`);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    }
    // At the foot of the page the last sheet is the one being read, even if it is too short to reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = SHEET_IDS[SHEET_IDS.length - 1];
    if (turning) return;
    setActive(current);
    if (location.pathname !== sheetPath(current)) {
      history.replaceState(history.state, "", sheetPath(current));
      document.title = sheetTitles[current];
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(read);
  };
  reread = onScroll;
  const onPop = () => {
    const id = sheetFromPath(location.pathname);
    goToSheet(id, { push: false });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("popstate", onPop);
  return () => {
    cancelAnimationFrame(frame);
    reread = null;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("popstate", onPop);
  };
}
