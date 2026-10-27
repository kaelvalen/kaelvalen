"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePlotOnView } from "@/lib/plot";

type Op = "add" | "serve" | "remove";
const ops: Op[] = ["add", "serve", "remove"];

/** Breaks a label into lines of at most `max` characters, on word boundaries. */
function wrap(text: string, max = 15) {
  const lines: string[] = [];
  for (const w of text.split(" ")) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + " " + w).length <= max) lines[lines.length - 1] = cur + " " + w;
    else lines.push(w);
  }
  return lines;
}

/** The operation as a plotted flow: one box per step, joined by leaders, the last step in markup colour. */
function Flow({ titles, label }: { titles: string[]; label: string }) {
  const ref = useRef<SVGSVGElement>(null);
  usePlotOnView(ref, { budget: 1400 });
  const n = titles.length;
  const W = 640;
  const gap = 22;
  const bw = (W - 8 - gap * (n - 1)) / n;
  const bh = 58;
  const y = 14;
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${y * 2 + bh}`} role="img" aria-label={label} className="ink-bleed block h-auto w-full">
      {titles.map((title, i) => {
        const x = 4 + i * (bw + gap);
        const end = i === n - 1;
        const lines = wrap(title);
        return (
          <g key={title}>
            <rect data-plot={i * 2} x={x} y={y} width={bw} height={bh} fill="none" strokeWidth={end ? 1.6 : 1} className={end ? "stroke-accent" : "stroke-ink"} />
            {i < n - 1 && (
              <path data-plot={i * 2 + 1} d={`M${x + bw} ${y + bh / 2} h${gap - 1} m-6 -4 l6 4 l-6 4`} fill="none" strokeWidth="1" className="stroke-ink" />
            )}
            <text data-plot-label data-after={i * 2} x={x + bw / 2} y={y + bh / 2 - (lines.length - 1) * 6.5 + 3.5} textAnchor="middle" fontSize="11" className={end ? "fill-accent" : "fill-ink"}>
              {lines.map((l, j) => (
                <tspan key={l} x={x + bw / 2} dy={j ? 13 : 0}>
                  {l}
                </tspan>
              ))}
            </text>
            <text data-plot-label data-after={i * 2} x={x + 4} y={y - 4} fontSize="9" className="fill-muted font-mono">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** The three store operations as step-by-step flows, following the paper's Algorithm 1. */
export default function CerataPanel() {
  const { t } = useI18n();
  const c = t.diagram.cerata;
  const [op, setOp] = useState<Op>("add");
  const steps = c.steps[op];

  return (
    <div className="space-y-6">
      <p className="max-w-[66ch] text-a9 text-ink-soft">{c.intro}</p>

      <div role="group" aria-label={c.opsLabel} className="flex flex-wrap border border-line">
        {ops.map((o) => {
          const on = op === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => setOp(o)}
              className={`flex-1 cursor-pointer border-r border-line px-4 py-2.5 text-sm last:border-r-0 transition-colors ${
                on ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              }`}
            >
              {c.ops[o]}
            </button>
          );
        })}
      </div>

      <div className="drafting-grid hidden border border-line bg-paper p-3 sm:block">
        <Flow key={op} titles={steps.map((s) => s.title)} label={`${c.ops[op]}: ${steps.map((s) => s.title).join(", ")}`} />
      </div>

      <ol key={op} className="animate-fade-in">
        {steps.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute top-8 bottom-0 left-[1.25rem] w-px -translate-x-1/2 bg-line-strong" />
            )}
            <span className="flex h-8 w-10 items-center justify-center border border-ink text-sm tabular-nums text-ink">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="font-semibold text-ink">{s.title}</p>
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-soft text-pretty">{s.desc}</p>
              <p className="mt-2 inline-block border border-line bg-surface px-2.5 py-1 font-mono text-xs text-ink">{s.spec}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink">{c.invariant}</p>
    </div>
  );
}
