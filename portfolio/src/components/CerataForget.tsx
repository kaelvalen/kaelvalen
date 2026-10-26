"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

const ROWS = 8;
const COLS = 24;

type Edit = { k: number[]; v: number[] };

// Park–Miller PRNG so the base matrix and every edit are reproducible.
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s / 2147483647) * 2 - 1;
  };
}

const BASE = (() => {
  const r = prng(7);
  return Float64Array.from({ length: ROWS * COLS }, () => r() * 0.5);
})();

/** 64-bit checksum (two 32-bit FNV-style lanes) over the raw float64 bytes. */
function checksum(a: Float64Array) {
  const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < b.length; i++) {
    h1 = Math.imul(h1 ^ b[i], 16777619);
    h2 = Math.imul(h2 + b[i], 2654435761);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

const BASE_SUM = checksum(BASE);

/** W = base + Σ k vᵀ, always recomputed from the base so removal is exact. */
function apply(edits: Edit[]) {
  const w = new Float64Array(BASE);
  for (const { k, v } of edits)
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) w[r * COLS + c] += k[r] * v[c];
  return w;
}

export default function CerataForget() {
  const { t } = useI18n();
  const f = t.research.forget;
  const [edits, setEdits] = useState<Edit[]>([]);
  const [seed, setSeed] = useState(11);

  const w = useMemo(() => apply(edits), [edits]);
  const sum = checksum(w);
  const same = sum === BASE_SUM;
  let maxDelta = 0;
  for (let i = 0; i < w.length; i++) maxDelta = Math.max(maxDelta, Math.abs(w[i] - BASE[i]));

  const learn = () => {
    const r = prng(seed);
    const k = Array.from({ length: ROWS }, () => (r() > 0.2 ? r() * 0.6 : 0));
    const v = Array.from({ length: COLS }, () => (r() > 0.3 ? r() : 0));
    setSeed((s) => s + 101);
    setEdits((e) => [...e, { k, v }]);
  };
  const forget = () => setEdits((e) => e.slice(0, -1));

  return (
    <figure className="flex h-full flex-col">
      <div className="flex-1 px-5 py-8 sm:px-8">
        <p className="letter-wide max-w-xl text-2xl font-medium leading-tight text-ink text-balance">{f.title}</p>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft text-pretty">{f.body}</p>

        <div
          role="img"
          aria-label={f.matrixLabel}
          className="mt-8 grid gap-[2px] border border-line bg-surface p-2"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {Array.from(w, (x, i) => {
            const d = Math.abs(x - BASE[i]);
            const mag = Math.min(1, Math.abs(x) * 1.6);
            const bg =
              d > 1e-12
                ? `color-mix(in srgb, var(--accent) ${Math.round(35 + Math.min(65, d * 200))}%, transparent)`
                : `color-mix(in srgb, var(--ink) ${Math.round(x >= 0 ? 8 + mag * 70 : 3 + mag * 22)}%, transparent)`;
            return <span key={i} className="aspect-square transition-colors duration-300" style={{ background: bg }} />;
          })}
        </div>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted">{f.base}</dt>
          <dd className="font-mono text-ink">{BASE_SUM}</dd>
          <dt className="text-muted">{f.current}</dt>
          <dd className={`font-mono ${same ? "text-ok" : "text-accent"}`}>{sum}</dd>
          <dt className="text-muted">{f.edits}</dt>
          <dd className="tabular-nums text-ink">{edits.length}</dd>
          <dt className="text-muted">{f.maxDelta}</dt>
          <dd className="font-mono text-ink">{maxDelta === 0 ? "0" : maxDelta.toExponential(2)}</dd>
        </dl>
        <p aria-live="polite" className={`mt-3 text-sm font-medium ${same ? "text-ok" : "text-accent"}`}>
          {same ? f.identical : f.carrying(edits.length)}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={learn}
            className="cursor-pointer bg-ink px-4 py-2.5 font-mono text-sm text-paper transition-opacity hover:opacity-85"
          >
            {f.learn}
          </button>
          <button
            type="button"
            onClick={forget}
            disabled={edits.length === 0}
            className="cursor-pointer border border-ink px-4 py-2.5 font-mono text-sm text-ink transition-colors hover:bg-paper-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            {f.forget}
          </button>
        </div>
      </div>

      <figcaption className="border-t border-line px-5 py-3 text-sm text-muted sm:px-8">
        <span className="font-semibold text-accent">{f.fig}</span> {f.note}
      </figcaption>
    </figure>
  );
}
