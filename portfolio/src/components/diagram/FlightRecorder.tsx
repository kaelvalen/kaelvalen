"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePlotOnView } from "@/lib/plot";
import { DEFAULT_CUSUM } from "@/lib/cusum";
import { BLOCKS } from "@/lib/run-sim";
import type { FromRecorder, Reading, ToRecorder } from "@/workers/recorder";

// Chart geometry, in CSS pixels: the viewBox follows the figure's width, so lettering stays at size.
// Loss panel on top, CUSUM strip below.
const X0 = 44;
const LOSS = { top: 18, bottom: 168 };
const CUS = { top: 192, bottom: 252 };
const WINDOW = 240;
const S_MAX = DEFAULT_CUSUM.h * 3;

const fmt = (n: number, d = 2) => n.toFixed(d);

export default function FlightRecorder() {
  const { t, locale } = useI18n();
  const s = t.diagram.trainscope;
  const svgRef = useRef<SVGSVGElement>(null);
  const plotBox = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const figRef = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const wantRunning = useRef(true);

  const [readings, setReadings] = useState<Reading[]>([]);
  const [lr, setLr] = useState(1);
  const [running, setRunning] = useState(false);
  const [halted, setHalted] = useState(false);
  const [streaming, setStreaming] = useState(true);

  usePlotOnView(svgRef, { budget: 1800 });

  useLayoutEffect(() => {
    const el = plotBox.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const X1 = width - 14;

  const send = (m: ToRecorder) => worker.current?.postMessage(m);

  // The worker starts when the figure first comes into view, and sleeps whenever it leaves.
  useEffect(() => {
    const el = figRef.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStreaming(!still);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !worker.current) {
        const w = new Worker("/workers/recorder.js", { type: "module" });
        w.onmessage = (ev: MessageEvent<FromRecorder>) => {
          const m = ev.data;
          if (m.type === "reset") {
            setReadings(m.readings.slice(-WINDOW));
            setLr(m.lr);
          } else if (m.type === "readings") setReadings((cur) => [...cur, ...m.readings].slice(-WINDOW));
          else {
            setRunning(m.running);
            setHalted(m.halted);
          }
        };
        worker.current = w;
        w.postMessage({ type: "start", seed: 11, streaming: !still } satisfies ToRecorder);
      } else if (worker.current) {
        send(e.isIntersecting && wantRunning.current ? { type: "play" } : { type: "pause" });
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      worker.current?.terminate();
      worker.current = null;
    };
  }, []);

  const toggleRun = () => {
    wantRunning.current = !running || halted;
    send(running ? { type: "pause" } : { type: "play" });
  };

  // ---- derived readings -------------------------------------------------------------------
  const first = readings[0]?.step ?? 0;
  const last = readings[readings.length - 1];
  const x = (step: number) => X0 + ((step - first) / (WINDOW - 1)) * (X1 - X0);
  const lo = readings.length ? Math.min(...readings.map((r) => r.reference)) - 0.3 : 1.8;
  const hi = lo + 1.5;
  const yL = (v: number) => LOSS.bottom - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (LOSS.bottom - LOSS.top);
  const yS = (v: number) => CUS.bottom - (Math.min(S_MAX, v) / S_MAX) * (CUS.bottom - CUS.top);
  const line = (f: (r: Reading) => number) => readings.map((r) => `${x(r.step).toFixed(1)},${f(r).toFixed(1)}`).join(" ");

  const alarm = readings.find((r) => r.alarm);
  const spike = readings.find((r) => r.spike);
  const lead = alarm && spike ? spike.step - alarm.step : null;

  // The block that moved first: the earliest to pass 1.25× its nominal norm.
  const moved = BLOCKS.map((_, i) => readings.find((r) => r.grads[i] > 1.25)?.step ?? Infinity);
  const firstBlock = Math.min(...moved) < Infinity ? moved.indexOf(Math.min(...moved)) : -1;
  const gmax = Math.max(2, ...(last?.grads ?? [1]));

  const n = (v: number) => v.toLocaleString(locale === "tr" ? "tr-TR" : "en-US");
  const status = !last
    ? s.idle
    : spike
      ? lead !== null
        ? s.caught(lead)
        : s.missed
      : alarm
        ? s.alarmed(n(alarm.step))
        : lr > 1
          ? s.drifting
          : s.nominal;

  return (
    <div ref={figRef} className="space-y-6">
      <div className="grid gap-4 border-b border-line pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="grid gap-2 text-sm text-ink-soft">
          <span className="flex items-baseline justify-between gap-4">
            <span>{s.lr}</span>
            <output className="font-mono text-ink">{fmt(lr, 1)}×</output>
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={lr}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLr(v);
              send({ type: "lr", value: v });
            }}
            className="w-full accent-[var(--accent)]"
            aria-describedby="recorder-status"
          />
        </label>
        {streaming && (
          <button
            type="button"
            onClick={toggleRun}
            className="min-h-10 cursor-pointer border border-ink px-4 text-sm text-ink transition-colors hover:bg-paper-dim"
          >
            {halted ? s.restart : running ? s.pause : s.play}
          </button>
        )}
      </div>

      <div ref={plotBox} className="drafting-grid border border-line bg-paper">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line px-4 py-2 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-4 bg-ink" /> {s.loss}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block w-4 border-t border-dashed border-muted" /> {s.reference}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-4 bg-accent" /> {s.cusum}</span>
          <span className="ml-auto font-mono">k = {DEFAULT_CUSUM.k} · h = {DEFAULT_CUSUM.h}</span>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} 280`}
          role="img"
          aria-label={s.chartLabel}
          className="ink-bleed block h-[280px] w-full select-none"
        >
          {/* Frame, axes and graticule: plotted once, the first time the figure is seen. */}
          <g fill="none" strokeWidth="1">
            <path data-plot="1" d={`M${X0} ${LOSS.top} V${LOSS.bottom} H${X1}`} className="stroke-ink" />
            <path data-plot="2" d={`M${X0} ${CUS.top} V${CUS.bottom} H${X1}`} className="stroke-ink" />
            {[0.25, 0.5, 0.75].map((f, i) => (
              <path key={f} data-plot={3 + i} d={`M${X0} ${LOSS.top + f * (LOSS.bottom - LOSS.top)} H${X1}`} className="stroke-line" strokeDasharray="2 4" />
            ))}
            <path data-plot="6" d={`M${X0} ${yS(DEFAULT_CUSUM.h)} H${X1}`} className="stroke-accent" strokeDasharray="5 3" />
          </g>
          <g className="fill-muted font-mono" fontSize="11" data-plot-label data-after="2">
            <text x={X0 - 6} y={LOSS.top + 3} textAnchor="end">{fmt(hi, 1)}</text>
            <text x={X0 - 6} y={LOSS.bottom + 3} textAnchor="end">{fmt(lo, 1)}</text>
            <text x={X0 - 6} y={yS(DEFAULT_CUSUM.h) + 3} textAnchor="end">h</text>
            <text x={X0 - 6} y={CUS.bottom + 3} textAnchor="end">0</text>
            <text x={X0} y={270}>{s.step} {n(first)}</text>
            <text x={X1} y={270} textAnchor="end">{n(last?.step ?? WINDOW)}</text>
            <text x={X1} y={CUS.top - 4} textAnchor="end" className="fill-accent">Sₖ</text>
          </g>

          {/* Live traces. */}
          {readings.length > 1 && (
            <g fill="none" strokeLinejoin="round">
              <polyline points={line((r) => yL(r.reference))} className="stroke-muted" strokeWidth="1" strokeDasharray="3 3" />
              <polyline points={line((r) => yL(r.loss))} className="stroke-ink" strokeWidth="1.5" />
              <polyline points={line((r) => yS(r.s))} className="stroke-accent" strokeWidth="1.3" />
            </g>
          )}
          {alarm && (
            <g className="text-accent">
              <path d={`M${x(alarm.step)} ${LOSS.top} V${CUS.bottom}`} stroke="currentColor" strokeDasharray="4 3" />
              <circle cx={x(alarm.step)} cy={yS(alarm.s)} r="3.5" fill="currentColor" />
              <text x={x(alarm.step) + 5} y={LOSS.top + 10} fontSize="11" fill="currentColor" className="letter-cond uppercase">
                {s.alarmMark}
              </text>
            </g>
          )}
          {spike && (
            <g className="text-ink">
              <path d={`M${x(spike.step)} ${LOSS.top} V${LOSS.bottom}`} stroke="currentColor" strokeDasharray="2 3" />
              <text x={x(spike.step) + 5} y={LOSS.top + 22} fontSize="11" fill="currentColor" className="letter-cond uppercase">
                {s.spikeMark}
              </text>
            </g>
          )}
          {/* The pen: it is drawing the newest step. */}
          {last && !halted && running && <circle cx={x(last.step)} cy={yL(last.loss)} r="3" className="fill-accent" />}
        </svg>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="border border-line text-sm md:col-span-6">
        <dl className="grid grid-cols-2">
          {[
            [s.stepLabel, last ? n(last.step) : "–"],
            ["Sₖ", last ? fmt(last.s) : "–"],
            [s.alarmLabel, alarm ? n(alarm.step) : "–"],
            [s.spikeLabel, spike ? n(spike.step) : "–"],
          ].map(([k, v], i) => (
            <div key={k} className={`px-4 py-3 ${i % 2 ? "" : "border-r"} ${i < 2 ? "border-b" : ""} border-line`}>
              <dt className="letter-cond text-a10 uppercase text-muted">{k}</dt>
              <dd className="font-mono text-ink">{v}</dd>
            </div>
          ))}
        </dl>
          <p
            id="recorder-status"
            aria-live="polite"
            className={`border-t border-line px-4 py-3 text-sm ${spike && lead !== null ? "font-medium text-accent" : "text-ink-soft"}`}
          >
            {status}
          </p>
        </div>

        <div className="border border-line p-4 text-xs md:col-span-6">
          <div className="mb-2 flex items-center justify-between text-muted">
            <span>{s.perBlock}</span>
            {firstBlock >= 0 && <span className="text-accent">{s.firstMoved(BLOCKS[firstBlock])}</span>}
          </div>
          <div className="space-y-1.5">
            {BLOCKS.map((b, i) => {
              const g = last?.grads[i] ?? 1;
              return (
                <div key={b} className="flex items-center gap-3">
                  <span className={`w-14 shrink-0 font-mono ${i === firstBlock ? "text-accent" : "text-muted"}`}>{b}</span>
                  <div className="relative h-2.5 flex-1 border border-line bg-paper" role="meter" aria-label={`${b} L2`} aria-valuemin={0} aria-valuemax={gmax} aria-valuenow={Number(g.toFixed(2))}>
                    <div className={`h-full ${g > 1.25 ? "bg-accent" : "bg-line-strong"}`} style={{ width: `${(g / gmax) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums text-muted">{fmt(g)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">{s.telemetryNote}</p>
    </div>
  );
}
