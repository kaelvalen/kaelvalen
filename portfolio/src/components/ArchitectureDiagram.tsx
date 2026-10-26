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

  const label = (m: Mode) => (m === "trainscope" ? d.tabTrainscope : d.tabCerata);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = modes[(i + (e.key === "ArrowRight" ? 1 : -1) + modes.length) % modes.length];
    setMode(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div className="flex flex-col border-b border-line sm:flex-row sm:items-stretch sm:justify-between">
        <h3 className="px-5 py-3 text-sm font-semibold text-ink sm:px-8">{d.title}</h3>

        <div role="tablist" aria-label={d.tablist} className="flex items-stretch border-t border-line sm:border-t-0">
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
                className={`flex-1 cursor-pointer border-l border-line px-5 py-3 text-sm transition-colors sm:flex-none ${
                  on ? "bg-ink font-medium text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                }`}
              >
                {label(m)}
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
        className="animate-fade-in px-5 py-6 sm:px-8 sm:py-8"
        key={mode}
      >
        {mode === "cerata" ? <CerataPanel /> : <TrainscopePanel />}
      </div>
    </div>
  );
}
