"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Op = "add" | "serve" | "remove";
const ops: Op[] = ["add", "serve", "remove"];

/** The three store operations as step-by-step flows, following the paper's Algorithm 1. */
export default function CerataPanel() {
  const { t } = useI18n();
  const c = t.diagram.cerata;
  const [op, setOp] = useState<Op>("add");
  const steps = c.steps[op];

  return (
    <div className="space-y-6">
      <p className="max-w-[66ch] text-[0.95rem] leading-relaxed text-ink-soft">{c.intro}</p>

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
