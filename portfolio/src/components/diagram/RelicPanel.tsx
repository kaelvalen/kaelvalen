"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Op = "add" | "serve" | "remove";
const ops: Op[] = ["add", "serve", "remove"];

/** The three store operations as step-by-step flows, following the paper's Algorithm 1. */
export default function RelicPanel() {
  const { t } = useI18n();
  const c = t.diagram.relic;
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

      {/* The steps run left to right on wide screens, top to bottom otherwise; the last one commits. */}
      <ol key={op} className="animate-fade-in grid gap-6 lg:auto-cols-fr lg:grid-flow-col lg:gap-0">
        {steps.map((s, i) => {
          const end = i === steps.length - 1;
          return (
            <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 lg:block lg:pr-6">
              {!end && (
                <span
                  aria-hidden
                  className="absolute top-8 -bottom-6 left-5 w-px -translate-x-1/2 bg-line-strong lg:top-4 lg:right-0 lg:bottom-auto lg:left-10 lg:h-px lg:w-auto lg:translate-x-0"
                />
              )}
              <span className={`flex h-8 w-10 items-center justify-center border text-sm tabular-nums ${end ? "border-accent text-accent" : "border-ink text-ink"}`}>
                {i + 1}
              </span>
              <div className="pt-1 lg:pt-4">
                <p className={`font-semibold ${end ? "text-accent" : "text-ink"}`}>{s.title}</p>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-soft text-pretty">{s.desc}</p>
                <p className="mt-2 inline-block border border-line bg-surface px-2.5 py-1 font-mono text-xs text-ink">{s.spec}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink">{c.invariant}</p>
    </div>
  );
}
