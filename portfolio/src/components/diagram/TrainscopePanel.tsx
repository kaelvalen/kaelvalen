"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_STEP, getSimulationProfile, type GradStatus, type SurgeKey } from "@/lib/trainscope-sim";

const surges: SurgeKey[] = ["1.0", "2.5", "5.0"];

// Chart geometry (viewBox 0 0 580 180).
const X0 = 50;
const X_SPAN = 465;
const stepToX = (step: number) => X0 + ((step - 10) / 50) * X_SPAN;

// Clamp so curves never leave the plot area.
function coords(step: number, val: number, minV: number, maxV: number) {
  const clamped = Math.max(minV, Math.min(maxV, val));
  return { x: stepToX(step), y: 145 - ((clamped - minV) / (maxV - minV)) * 105 };
}

// Catmull-Rom spline through the given points, as cubic bezier segments.
function curve(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const barColor: Record<GradStatus, string> = {
  critical: "bg-accent-deep",
  alert: "bg-accent",
  warning: "bg-ink/60",
  normal: "bg-line-strong",
};

const chip = (on: boolean, hot = false) =>
  `cursor-pointer rounded border px-2.5 py-1 transition-colors ${
    on
      ? hot
        ? "border-accent-deep bg-accent-deep font-semibold text-on-accent"
        : "border-ink bg-ink font-semibold text-paper"
      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
  }`;

export default function TrainscopePanel() {
  const { t } = useI18n();
  const s = t.diagram.trainscope;
  const [surge, setSurge] = useState<SurgeKey>("1.0");
  const [step, setStep] = useState<number>(DEFAULT_STEP["1.0"]);

  const profile = getSimulationProfile(surge);
  const points = profile.points;
  const active = points.find((p) => p.step === step) ?? points[2];
  const activeX = stepToX(active.step);

  const lossXY = points.map((p) => coords(p.step, p.loss, 1, 10));
  const lossD = curve(lossXY);
  const kurtD = curve(points.map((p) => coords(p.step, p.kurtosis, 0, 100)));
  const cusumD = curve(points.map((p) => coords(p.step, p.cusum, 0, 12)));
  const areaD = `${lossD} L ${lossXY[lossXY.length - 1].x} 145 L ${lossXY[0].x} 145 Z`;

  const kurtX = stepToX(profile.kurtosisAlertStep);
  const cusumX = stepToX(profile.cusumAlertStep);

  const pickSurge = (k: SurgeKey) => {
    setSurge(k);
    setStep(DEFAULT_STEP[k]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 text-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-sans text-xs text-ink-soft">{s.simulate}</p>
          <div role="group" aria-label={s.simulate} className="flex flex-wrap gap-1 text-[10px]">
            {surges.map((k) => (
              <button key={k} type="button" aria-pressed={surge === k} onClick={() => pickSurge(k)} className={chip(surge === k, k !== "1.0")}>
                {s.surges[k]}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label={s.steps} className="flex flex-wrap gap-1 text-[11px]">
          {points.map((p) => (
            <button
              key={p.step}
              type="button"
              aria-pressed={step === p.step}
              onClick={() => setStep(p.step)}
              className={chip(step === p.step, p.step >= profile.kurtosisAlertStep)}
            >
              s{p.step}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-line bg-paper p-4">
        <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] uppercase tracking-wider text-muted">
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-3 bg-ink" /> {s.loss}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block w-3 border-t-2 border-dashed border-muted" /> {s.kurtosis}</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="inline-block w-3 border-t-2 border-dashed border-accent-deep" /> {s.cusum}</span>
        </div>

        <div className="overflow-x-auto">
          <svg viewBox="0 0 580 180" role="img" aria-label={s.chartLabel} className="h-52 w-full min-w-[540px] select-none">
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--accent-deep)", stopOpacity: 0.22 }} />
                <stop offset="100%" style={{ stopColor: "var(--accent-deep)", stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {[
              { y: 40, label: "10.0", dashed: true },
              { y: 92, label: "5.0", dashed: true },
              { y: 145, label: "1.0", dashed: false },
            ].map((g) => (
              <g key={g.label}>
                <text x="42" y={g.y + 3} className="fill-muted" fontSize="8" fontFamily="var(--font-geist-mono), monospace" textAnchor="end">
                  {g.label}
                </text>
                <line x1="48" y1={g.y} x2="520" y2={g.y} className="stroke-line-strong" strokeDasharray={g.dashed ? "3 3" : undefined} />
              </g>
            ))}

            <line x1={kurtX} y1="24" x2={kurtX} y2="145" className="stroke-muted" strokeDasharray="2 2" strokeWidth="1.5" />
            <text x={kurtX} y="16" className="fill-muted" fontSize="8.5" fontWeight="bold" textAnchor={kurtX > 300 ? "end" : "start"}>
              {profile.kurtosisLabel}
            </text>
            <line x1={cusumX} y1="32" x2={cusumX} y2="145" className="stroke-accent-deep" strokeDasharray="2 2" strokeWidth="1.5" />
            <text x={cusumX} y="26" className="fill-accent-deep" fontSize="8.5" fontWeight="bold" textAnchor={cusumX > 400 ? "end" : "start"}>
              {profile.cusumLabel}
            </text>

            <line x1={activeX} y1="40" x2={activeX} y2="145" className="stroke-line-strong" strokeDasharray="1 2" />

            <path d={areaD} fill="url(#lossGradient)" />
            <path d={kurtD} fill="none" className="stroke-muted" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d={cusumD} fill="none" className="stroke-accent-deep" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d={lossD} fill="none" className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" />

            {points.map((p, i) => {
              const { x, y } = lossXY[i];
              const selected = p.step === step;
              const spike = p.step >= profile.kurtosisAlertStep;
              return (
                <g key={p.step} className="cursor-pointer" onClick={() => setStep(p.step)}>
                  <circle cx={x} cy={y} r="16" fill="transparent" />
                  <circle cx={x} cy={y} r={selected ? 5.5 : 3.5} className={spike ? "fill-accent-deep" : "fill-ink"} />
                  {selected && (
                    <circle cx={x} cy={y} r="8.5" fill="none" strokeWidth="1.5" className={spike ? "stroke-accent-deep" : "stroke-ink"} />
                  )}
                  <text x={x} y="162" className="fill-muted" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle">
                    s{p.step}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="space-y-2 rounded-lg border border-line border-l-2 border-l-accent-deep bg-paper-dim/60 p-4 text-xs md:col-span-6">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-accent-deep">
              {s.step} {active.step} · {active.status}
            </span>
            <span className="shrink-0 text-xs text-muted">
              {s.lossShort}: {active.loss.toFixed(2)}
            </span>
          </div>
          <p className="font-sans text-sm text-ink-soft">
            {s.story}: <span className="font-mono font-medium text-ink">{active.layer}</span>
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-muted">
            <span>CUSUM S_k: {active.cusum.toFixed(2)}σ</span>
            <span>Kurtosis: {active.kurtosis.toFixed(1)}</span>
            <span>{s.storage}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-line bg-paper-dim/60 p-4 text-xs md:col-span-6">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted">
            <span>{s.perBlock}</span>
            <span>{s.step} {active.step}</span>
          </div>
          <div className="space-y-1.5 pt-1 text-[11px]">
            {active.grads.map((g) => (
              <div key={g.name} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-muted">{g.name}</span>
                <div
                  className="relative h-3 flex-1 overflow-hidden rounded-sm border border-line bg-paper"
                  role="meter"
                  aria-label={`${g.name} L2`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={g.pct}
                >
                  <div className={`h-full transition-all duration-300 ${barColor[g.status]}`} style={{ width: `${g.pct}%` }} />
                </div>
                <span className="w-12 text-right font-semibold tabular-nums text-muted">{g.l2.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted">{s.telemetryNote}</p>
    </div>
  );
}
