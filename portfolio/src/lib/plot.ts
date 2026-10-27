"use client";

import { useEffect, type RefObject } from "react";
import { cubicBezier } from "./paper-gl";

/*
 * The pen plotter. Every stroke marked [data-plot] in a figure is drawn in order by one pen: it
 * travels to the stroke's start with the pen up (leaving a faint dotted trace, as a plotter's travel
 * moves show on a test plot), puts the pen down, draws at constant speed, and lifts. Labels marked
 * [data-plot-label] are inked once their stroke (data-after, a stroke index) is down, or at the end.
 *
 * Timing comes from the motion tokens in globals.css: pen speed is constant, travel takes
 * --dur-travel, and the whole plot is capped so a dense figure never keeps the reader waiting.
 */

const easePen = cubicBezier(0.5, 0, 0.2, 1);
const SVG_NS = "http://www.w3.org/2000/svg";

type Stroke = SVGGeometryElement & { dataset: DOMStringMap };

export type PlotOptions = {
  /** Pen speed in user units per millisecond. */
  speed?: number;
  /** Upper bound on the whole plot, in milliseconds. */
  budget?: number;
  signal?: AbortSignal;
};

function strokes(svg: SVGSVGElement) {
  return [...svg.querySelectorAll<Stroke>("[data-plot]")]
    .map((el, i) => ({ el, order: Number(el.dataset.plot) || i }))
    .sort((a, b) => a.order - b.order)
    .map((s) => s.el);
}

const labels = (svg: SVGSVGElement) => [...svg.querySelectorAll<SVGElement>("[data-plot-label]")];

/** Puts a figure in its finished state: every stroke down, every label inked. */
export function finishPlot(svg: SVGSVGElement) {
  for (const s of strokes(svg)) {
    s.style.strokeDasharray = s.dataset.dash ?? "";
    s.style.strokeDashoffset = "";
  }
  for (const l of labels(svg)) l.style.opacity = "";
  svg.querySelectorAll("[data-plot-pen]").forEach((n) => n.remove());
}

/** Hides every stroke and label, ready to be plotted. */
function blank(svg: SVGSVGElement) {
  for (const s of strokes(svg)) {
    s.dataset.dash ??= s.getAttribute("stroke-dasharray") ?? "";
    const L = s.getTotalLength();
    s.style.strokeDasharray = `${L} ${L}`;
    s.style.strokeDashoffset = `${L}`;
  }
  for (const l of labels(svg)) l.style.opacity = "0";
}

export async function plot(svg: SVGSVGElement, { speed = 0.55, budget = 2600, signal }: PlotOptions = {}) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return finishPlot(svg);
  const list = strokes(svg);
  if (!list.length) return;
  blank(svg);

  const lengths = list.map((s) => s.getTotalLength());
  const travel = (a: DOMPoint, b: DOMPoint) => Math.min(220, Math.max(60, Math.hypot(b.x - a.x, b.y - a.y) / 1.6));
  // Scale the pen speed so the plot fits the budget.
  const planned = lengths.reduce((t, L) => t + Math.min(900, Math.max(110, L / speed)), 0) + list.length * 140;
  const k = planned > budget ? planned / budget : 1;

  const pen = document.createElementNS(SVG_NS, "circle");
  pen.setAttribute("r", "2.6");
  pen.setAttribute("class", "fill-accent");
  pen.dataset.plotPen = "";
  const trace = document.createElementNS(SVG_NS, "path");
  trace.setAttribute("fill", "none");
  trace.setAttribute("class", "stroke-line-strong");
  trace.setAttribute("stroke-width", "0.8");
  trace.setAttribute("stroke-dasharray", "1 4");
  trace.dataset.plotPen = "";
  svg.append(trace, pen);

  const put = (p: { x: number; y: number }) => pen.setAttribute("transform", `translate(${p.x} ${p.y})`);
  const tween = (ms: number, f: (e: number) => void) =>
    new Promise<boolean>((done) => {
      const t0 = performance.now();
      const step = (now: number) => {
        if (signal?.aborted) return done(false);
        const t = Math.min(1, (now - t0) / ms);
        f(easePen(t));
        if (t < 1) requestAnimationFrame(step);
        else done(true);
      };
      requestAnimationFrame(step);
    });

  const pending = labels(svg);
  const ink = (upTo: number) => {
    for (const l of pending.filter((x) => Number(x.dataset.after ?? Infinity) <= upTo)) {
      l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: "forwards" }).finished.then(() => (l.style.opacity = ""));
      pending.splice(pending.indexOf(l), 1);
    }
  };

  let last: DOMPoint | null = null;
  let path = "";
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const L = lengths[i];
    const start = s.getPointAtLength(0);
    if (last) {
      path += ` M${last.x} ${last.y} L${start.x} ${start.y}`;
      trace.setAttribute("d", path);
      const a = last;
      if (!(await tween(travel(a, start) / k, (e) => put({ x: a.x + (start.x - a.x) * e, y: a.y + (start.y - a.y) * e })))) break;
    }
    const ok = await tween(Math.min(900, Math.max(110, L / speed)) / k, (e) => {
      s.style.strokeDashoffset = `${L * (1 - e)}`;
      put(s.getPointAtLength(L * e));
    });
    if (!ok) break;
    s.style.strokeDasharray = s.dataset.dash ?? "";
    s.style.strokeDashoffset = "";
    last = s.getPointAtLength(L);
    ink(i);
  }

  if (signal?.aborted) return finishPlot(svg);
  ink(Infinity);
  pen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
  await trace.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 300, fill: "forwards" }).finished;
  trace.remove();
  pen.remove();
}

/** Plots a figure the first time it is mostly on screen. */
export function usePlotOnView(ref: RefObject<SVGSVGElement | null>, options?: Omit<PlotOptions, "signal">) {
  const speed = options?.speed;
  const budget = options?.budget;
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const ac = new AbortController();
    // Hidden until plotted, so the reader never sees the finished figure flash first.
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) blank(svg);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        plot(svg, { speed, budget, signal: ac.signal });
      },
      { threshold: 0.35 }
    );
    io.observe(svg);
    // Printing shows the finished drawing.
    const onPrint = () => finishPlot(svg);
    window.addEventListener("beforeprint", onPrint);
    return () => {
      ac.abort();
      io.disconnect();
      window.removeEventListener("beforeprint", onPrint);
      finishPlot(svg);
    };
  }, [ref, speed, budget]);
}
