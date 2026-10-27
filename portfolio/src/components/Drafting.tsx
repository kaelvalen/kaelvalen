"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formatZone, subscribeLayout, zoneOfElement } from "@/lib/zones";

/** A live grid reference to another element ("2·A5"), as a link to it. Empty until the frame is measured. */
export function GridRef({ target, className = "" }: { target: string; className?: string }) {
  const zone = useSyncExternalStore(
    subscribeLayout,
    () => {
      const el = document.getElementById(target);
      const z = el && zoneOfElement(el);
      return z ? formatZone(z) : "";
    },
    () => ""
  );
  if (!zone) return null;
  return (
    <a href={`#${target}`} className={`font-mono tabular-nums underline decoration-line-strong underline-offset-2 hover:decoration-accent ${className}`}>
      {zone}
    </a>
  );
}

/** Watches an element's border-box size. */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const b = e.borderBoxSize?.[0];
      setSize({ w: b ? b.inlineSize : el.offsetWidth, h: b ? b.blockSize : el.offsetHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/**
 * A dimension line over a block of text, reporting its real measure: the block's width in pixels
 * and in characters of the block's own font (the width of "0", the CSS ch unit). The wrapper
 * shrinks to the text, so the line spans exactly what it reports. Resize the window and it re-reads.
 */
export function Dimension({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<{ px: number; ch: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    const text = el?.firstElementChild;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!el || !text || !ctx) return;
    const ro = new ResizeObserver(() => {
      const cs = getComputedStyle(text);
      // The canvas font shorthand rejects a percentage stretch (and silently falls back), so leave it out.
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const px = el.getBoundingClientRect().width;
      setM({ px, ch: px / ctx.measureText("0").width });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={`w-fit max-w-full ${className}`}>
      <div aria-hidden data-no-print className="dim-line mb-4 hidden font-mono text-a10 text-line-strong sm:flex">
        <span className="text-muted">
          {m ? `${Math.round(m.px)} px · ${Math.round(m.ch)} ch` : "\u00a0"}
        </span>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}

/** A reviewer's revision cloud: scallops around a rectangle, drawn clockwise. */
function cloudPath(w: number, h: number, r: number) {
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / (r * 2)));
    for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  };
  edge(0, 0, w, 0);
  edge(w, 0, w, h);
  edge(w, h, 0, h);
  edge(0, h, 0, 0);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= pts.length; i++) {
    const [x, y] = pts[i % pts.length];
    d += ` A${r} ${r} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/**
 * Marks content changed in the latest revision, the way a checker marks a drawing: a cloud around
 * it and a delta tag with the revision letter, matching a row in the revision table.
 */
export function RevisionCloud({ rev, label, children, className = "" }: { rev: string; label: string; children: React.ReactNode; className?: string }) {
  const [ref, size] = useSize<HTMLDivElement>();
  const pad = 7;
  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      <span className="sr-only">{label}</span>
      {size && (
        <svg
          aria-hidden
          data-no-print
          className="pointer-events-none absolute overflow-visible text-accent"
          style={{ left: -pad, top: -pad, width: size.w + pad * 2, height: size.h + pad * 2 }}
        >
          <path d={cloudPath(size.w + pad * 2, size.h + pad * 2, 7)} fill="none" stroke="currentColor" strokeWidth="1.1" />
          <g transform={`translate(${size.w + pad * 2 - 40} -6)`}>
            <path d="M0 0 L15 -24 L30 0 Z" className="fill-paper" stroke="currentColor" strokeWidth="1.1" />
            <text x="15" y="-4" textAnchor="middle" fontSize="10" fill="currentColor" className="font-mono">
              {rev}
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}
