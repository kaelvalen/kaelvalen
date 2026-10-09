"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Scale = "fast" | "medium" | "slow";
const scales: Scale[] = ["fast", "medium", "slow"];

// Language-neutral technical data. Names/descriptions come from the dictionary (same order).
const laneData: Record<Scale, { tab: string; mechanics: string[]; api: string[] }> = {
  fast: { tab: "FAST", mechanics: ["key = h · value = label / text", "O(1) write · exact delete"], api: ["write", "forget"] },
  medium: {
    tab: "MEDIUM",
    mechanics: ["A = ΣKᵀK · B = ΣKᵀV", "W = A⁻¹B · one accumulator pair", "learn adds · forget subtracts"],
    api: ["write", "forget"],
  },
  slow: {
    tab: "SLOW",
    mechanics: ["identity-init → train once → freeze", "by_arrival control · by_confusion gated"],
    api: ["consolidate"],
  },
};

const cardData: Record<Scale, { formula: string; specs: string[] }[]> = {
  fast: [
    { formula: "write: M ← M ∪ {(h, label)}", specs: ["key: h (frozen address)", "value: label or text", "base: content-hashed, immutable"] },
    { formula: "ŷ = argmax_i cos(h, h_i)", specs: ["retrieval: exact cosine", "learned params: 0", "index: ExactCosineIndex"] },
    { formula: "forget(id): M ← M \\ {(h_id, v_id)}", specs: ["forget: exact delete", "cost: O(1)", "keys trained: never"] },
  ],
  medium: [
    { formula: "A = Σ KᵀK,  B = Σ KᵀV", specs: ["stats: float64", "accumulators: A, B", "size: independent of #edits"] },
    { formula: "W = A⁻¹ B", specs: ["solution: W = A⁻¹B", "order: invariant", "matches one-shot ridge"] },
    { formula: "A ← A − ΔA,  B ← B − ΔB", specs: ["learn: add contribution", "forget: subtract (downdate)", "tolerance: 1e-10 · drift ≤ 4.2e-13"] },
  ],
  slow: [
    { formula: "E(z) = z + Δ(z),  E_init = id", specs: ["map: Z → Z", "init: identity (function-preserving)", "after fit: frozen"] },
    { formula: "π: data ↦ expert ∈ {by_arrival, by_confusion}", specs: ["by_arrival: control", "by_confusion: gated behind prereg", "boundaries: policy-defined"] },
    { formula: "consolidate(policy) → ConsolidationReport", specs: ["experts added: isolated", "after fit: frozen", "reversibility: bitwise"] },
  ],
};

function Connector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2 text-muted">
      <span aria-hidden className="text-[11px] leading-none">│</span>
      <span className="max-w-[16rem] text-center font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span>
      <span aria-hidden className="text-[11px] leading-none">▼</span>
    </div>
  );
}

const stage = "w-full rounded-lg border border-line bg-surface px-4 py-3 sm:w-3/4";

export default function CerataPanel() {
  const { t } = useI18n();
  const c = t.diagram.cerata;
  const [scale, setScale] = useState<Scale>("fast");
  const [activeCard, setActiveCard] = useState(0);

  const cards = c.cards[scale];
  const idx = Math.min(activeCard, cards.length - 1);
  const card = cards[idx];
  const data = cardData[scale][idx];

  return (
    <div className="space-y-6">
      <p className="font-sans text-sm leading-relaxed text-ink-soft">{c.intro}</p>

      <div className="rounded-lg border border-line bg-paper-dim/50 p-4 sm:p-5">
        <div className="flex justify-center">
          <div className={stage}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{c.base.label}</span>
              <span className="text-[10px] text-muted">{c.base.meta}</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-ink">{c.base.title}</div>
          </div>
        </div>

        <Connector label={c.c1} />

        <div className="flex justify-center">
          <div className="w-full rounded-lg border-2 border-ink bg-ink px-4 py-3 text-paper sm:w-3/4">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">{c.address.label}</span>
              <span className="text-[10px] opacity-70">{c.address.meta}</span>
            </div>
            <div className="mt-1 text-sm font-semibold">{c.address.title}</div>
            <div className="mt-0.5 text-[10px] opacity-75">{c.address.note}</div>
          </div>
        </div>

        <Connector label={c.c2} />

        <div className="flex justify-center">
          <div className={`${stage} border-l-2 border-l-accent-deep`}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-accent-deep">{c.router.label}</span>
              <span className="text-[10px] text-muted">{c.router.meta}</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-ink">{c.router.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded border border-line bg-paper-dim px-1.5 py-0.5 text-ink-soft">prototype</span>
              <span className="rounded border border-line bg-paper-dim px-1.5 py-0.5 text-ink-soft">ridge_class</span>
              <span className="rounded border border-accent-deep/40 bg-accent-deep/10 px-1.5 py-0.5 text-accent-deep">
                {c.router.purity}
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 pt-1 sm:px-4" aria-hidden="true">
          <div className="hidden grid-cols-3 gap-3 text-center text-muted md:grid">
            <span className="text-[11px] leading-none">▼</span>
            <span className="text-[11px] leading-none">▼</span>
            <span className="text-[11px] leading-none">▼</span>
          </div>
          <div className="text-center text-muted md:hidden">
            <span className="text-[11px] leading-none">▼</span>
          </div>
          <div className="pt-0.5 text-center text-[9px] uppercase tracking-[0.14em] text-muted">{c.branch}</div>
        </div>

        <div className="mt-2 rounded-lg border-2 border-dashed border-accent-deep/50 bg-accent-deep/5 p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-deep">{c.guards.title}</span>
            <span className="text-[10px] text-muted">{c.guards.tolerance}</span>
            <ul className="flex flex-wrap gap-1.5 text-[10px]">
              {c.guardNames.map((name, i) => (
                <li
                  key={name}
                  title={c.guardChecks[i]}
                  className="cursor-help rounded border border-accent-deep/40 bg-surface px-1.5 py-0.5 text-accent-deep"
                >
                  {i + 1} {name}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {scales.map((id) => {
              const on = scale === id;
              const lane = c.lanes[id];
              const ld = laneData[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setScale(id);
                    setActiveCard(0);
                  }}
                  aria-pressed={on}
                  className={`cursor-pointer rounded-lg border p-3.5 text-left transition-colors ${
                    on
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-surface text-ink hover:border-line-strong hover:bg-paper-dim"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-1 text-[10px] uppercase tracking-wider opacity-80">
                    <span>{ld.tab}</span>
                    <span>{lane.sub}</span>
                  </div>
                  <div className="text-xs font-semibold">{lane.title}</div>
                  <div className="mt-2 space-y-0.5 text-[10px] leading-relaxed">
                    {ld.mechanics.map((m) => (
                      <div key={m} className={on ? "text-paper/80" : "text-muted"}>{m}</div>
                    ))}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                    {ld.api.map((a) => (
                      <span
                        key={a}
                        className={`rounded border px-1.5 py-0.5 ${
                          on ? "border-paper/40 text-paper" : "border-line bg-paper-dim text-accent-deep"
                        }`}
                      >
                        {a}()
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Connector label={c.c3} />

        <div className="flex justify-center">
          <div className={stage}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{c.readout.label}</span>
              <span className="text-[10px] text-muted">predict(x) · state()</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-ink">{c.readout.title}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-line border-l-2 border-l-accent-deep bg-paper-dim/60 p-4 text-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink">{card.name}</span>
          <span className="rounded bg-accent-deep/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent-deep">
            {c.inspector} · {laneData[scale].tab}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {cards.map((cd, i) => (
            <button
              key={cd.name}
              type="button"
              onClick={() => setActiveCard(i)}
              aria-pressed={idx === i}
              className={`cursor-pointer rounded border px-2 py-0.5 transition-colors ${
                idx === i ? "border-ink bg-ink text-paper" : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {cd.metric}
            </button>
          ))}
        </div>

        <p className="font-sans text-sm leading-relaxed text-ink-soft">{card.desc}</p>
        <div className="overflow-x-auto rounded border border-line bg-surface p-2.5 text-[11px] text-accent-deep">
          {c.formula}: {data.formula}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted">
          {data.specs.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <div className="border-t border-line pt-2 text-[11px] text-muted">
          latent: 768 · tolerance: 1e-10 · storage: 5.3 MB/task · guards: 4
        </div>
      </div>
    </div>
  );
}
