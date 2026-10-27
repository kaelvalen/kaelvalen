"use client";

import { useEffect, useRef, useState } from "react";
import {
  COLUMNS,
  GOTO_ZONE,
  formatZone,
  rowsFor,
  setLayout,
  zoneAt,
  zoneRect,
  type GotoZoneDetail,
  type SheetBand,
  type Zone,
} from "@/lib/zones";

type Mark = { x: number; y: number; w: number; h: number; label: string; key: number };

const same = (a: Zone | null, b: Zone | null) => a === b || (!!a && !!b && a.sheet === b.sheet && a.col === b.col && a.row === b.row);

/** Column letters across the top and bottom border. The hovered column is picked out. */
function ColumnRuler({ active }: { active: number | null }) {
  return (
    <div aria-hidden className="hidden h-5 grid-cols-8 text-[10px] text-muted sm:grid" data-no-print>
      {COLUMNS.map((c, i) => (
        <span key={c} className={`flex items-center justify-center ${i ? "border-l border-line-strong" : ""} ${active === i ? "font-semibold text-accent" : ""}`}>
          {c}
        </span>
      ))}
    </div>
  );
}

/**
 * The drawing border. Columns A–H run across the frame and every sheet is divided into numbered
 * rows down both margins, so any point on the page has a reference such as "2·C4". The frame
 * measures itself and publishes the layout (lib/zones.ts); the cursor readout, figure captions and
 * the command palette all read references from it.
 */
export default function SheetFrame({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [bands, setBands] = useState<SheetBand[]>([]);
  const [hover, setHover] = useState<Zone | null>(null);
  const [mark, setMark] = useState<Mark | null>(null);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const measure = () => {
      frame = 0;
      const sy = window.scrollY;
      const ir = i.getBoundingClientRect();
      const top = o.getBoundingClientRect().top + sy;
      const sheets = [...i.querySelectorAll<HTMLElement>("[data-sheet]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { n: Number(el.dataset.sheet), top: r.top + sy, height: r.height, rows: rowsFor(r.height) };
      });
      setLayout({ left: ir.left + window.scrollX, width: ir.width, sheets });
      setBands(sheets.map((b) => ({ ...b, top: b.top - top })));
      track();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const track = () => {
      const z = pointer ? zoneAt(pointer.x + window.scrollX, pointer.y + window.scrollY) : null;
      setHover((prev) => (same(prev, z) ? prev : z));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      track();
    };
    const onLeave = () => {
      pointer = null;
      track();
    };

    const onGoto = (e: Event) => {
      const z = (e as CustomEvent<GotoZoneDetail>).detail;
      const r = zoneRect(z);
      if (!r) return;
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, r.y + r.h / 2 - window.innerHeight / 2), behavior: still ? "instant" : "smooth" });
      const origin = o.getBoundingClientRect();
      setMark({ x: r.x - (origin.left + window.scrollX), y: r.y - (origin.top + window.scrollY), w: r.w, h: r.h, label: formatZone(z), key: Date.now() });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(i);
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener(GOTO_ZONE, onGoto);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", track);
      window.removeEventListener(GOTO_ZONE, onGoto);
    };
  }, []);

  useEffect(() => {
    if (!mark) return;
    const t = setTimeout(() => setMark(null), 1700);
    return () => clearTimeout(t);
  }, [mark]);

  const rowRuler = (side: "left" | "right") =>
    bands.map((b) => (
      <div
        key={`${side}-${b.n}`}
        aria-hidden
        data-no-print
        className={`absolute hidden w-5 flex-col text-[10px] text-muted sm:flex ${side === "left" ? "left-0" : "right-0"}`}
        style={{ top: b.top, height: b.height }}
      >
        {Array.from({ length: b.rows }, (_, r) => {
          const on = hover?.sheet === b.n && hover.row === r + 1;
          return (
            <span key={r} className={`flex flex-1 items-center justify-center border-line-strong ${r ? "border-t" : ""} ${on ? "font-semibold text-accent" : ""}`}>
              {r + 1}
            </span>
          );
        })}
      </div>
    ));

  return (
    // A sheet has a size: past 1520 px the drawing stops growing and the paper shows around it.
    <div className="mx-auto max-w-[1520px] sm:p-3">
      <div ref={outer} className="relative sm:border-[1.5px] sm:border-ink sm:px-5">
        <ColumnRuler active={hover?.col ?? null} />
        <div ref={inner} className="sm:border sm:border-ink">
          {children}
        </div>
        <ColumnRuler active={hover?.col ?? null} />
        {rowRuler("left")}
        {rowRuler("right")}

        {mark && (
          <div
            key={mark.key}
            aria-hidden
            className="animate-zone-flash pointer-events-none absolute z-30 border-2 border-accent"
            style={{ left: mark.x, top: mark.y, width: mark.w, height: mark.h }}
          >
            <span className="absolute top-1/2 left-1/2 h-8 w-px -translate-1/2 bg-accent" />
            <span className="absolute top-1/2 left-1/2 h-px w-8 -translate-1/2 bg-accent" />
            <span className="absolute top-1 left-1 bg-accent px-1.5 font-mono text-xs text-on-accent">{mark.label}</span>
          </div>
        )}
      </div>

      {hover && (
        <div
          aria-hidden
          data-no-print
          className="pointer-events-none fixed bottom-3 left-3 z-30 hidden border border-ink bg-paper px-2 py-1 font-mono text-xs text-ink [@media(pointer:fine)]:block"
        >
          {formatZone(hover)}
        </div>
      )}
    </div>
  );
}
