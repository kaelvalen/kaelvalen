"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import CerataPanel from "./diagram/CerataPanel";
import TrainscopePanel from "./diagram/TrainscopePanel";

type Mode = "trainscope" | "cerata";
const modes: Mode[] = ["trainscope", "cerata"];

export default function ArchitectureDiagram() {
  const { t } = useI18n();
  const d = t.diagram;
  const [mode, setMode] = useState<Mode>("trainscope");
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ trainscope: null, cerata: null });

  const label = (m: Mode, i: number) =>
    `0${i + 1} ${m === "trainscope" ? d.tabTrainscope : d.tabCerata}`;

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = modes[(i + (e.key === "ArrowRight" ? 1 : -1) + modes.length) % modes.length];
    setMode(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="w-full rounded-[var(--radius-card)] border border-line bg-surface p-4 font-mono shadow-card sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="inline-block h-2 w-2 rounded-[2px] bg-accent-deep" />
          <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink">{d.title}</h3>
        </div>

        <div role="tablist" aria-label={d.tablist} className="flex items-center gap-1.5 text-xs">
          {modes.map((m, i) => {
            const on = mode === m;
            return (
              <button
                key={m}
                ref={(el) => {
                  tabRefs.current[m] = el;
                }}
                id={`diagram-tab-${m}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`diagram-panel-${m}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setMode(m)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`cursor-pointer rounded-md border px-3.5 py-1.5 transition-colors ${
                  on
                    ? "border-ink bg-ink font-medium text-paper"
                    : "border-line text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {label(m, i)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`diagram-panel-${mode}`}
        aria-labelledby={`diagram-tab-${mode}`}
        tabIndex={0}
        className="animate-fade-in rounded-md focus-visible:outline-offset-8"
        key={mode}
      >
        {mode === "cerata" ? <CerataPanel /> : <TrainscopePanel />}
      </div>
    </div>
  );
}
