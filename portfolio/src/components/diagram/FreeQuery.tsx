"use client";

import { useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/** A stored fact as the router sees it: subject, relation keys (templates with [X]), answer. */
export type RoutedFact = { id: number; subject: string; keys: string[]; answer: string; adapter: boolean };

// transformers.js and the encoder load only when the reader asks for them; nothing is bundled.
const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.web.min.js";
const MODEL = "Xenova/all-MiniLM-L6-v2";
/** The paper's threshold. On these keys it keeps every unrelated question tried on the base model. */
export const TAU = 0.75;

type Embed = (texts: string[]) => Promise<number[][]>;
let encoder: Promise<Embed> | null = null;

function loadEncoder(onProgress: (p: number) => void): Promise<Embed> {
  encoder ??= (async () => {
    const lib = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ LIB);
    const extract = await lib.pipeline("feature-extraction", MODEL, {
      dtype: "q8",
      progress_callback: (e: { status: string; progress?: number }) => {
        if (e.status === "progress" && typeof e.progress === "number") onProgress(e.progress);
      },
    });
    return async (texts: string[]) => (await extract(texts, { pooling: "mean", normalize: true })).tolist() as number[][];
  })().catch((err) => {
    encoder = null;
    throw err;
  });
  return encoder;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Edit distance, for typo-tolerant subject matching. */
function lev(a: string, b: string) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

/** Finds a stored subject in the question (whole subject, small typos allowed) and the words that matched it. */
function matchSubject(question: string, facts: RoutedFact[]) {
  const words = norm(question).split(" ");
  for (const f of facts) {
    const sw = norm(f.subject).split(" ");
    for (let i = 0; i + sw.length <= words.length; i++) {
      const span = words.slice(i, i + sw.length).join(" ");
      if (lev(span, sw.join(" ")) <= Math.floor(f.subject.length / 6)) return { fact: f, span };
    }
  }
  return null;
}

const cos = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

type Result =
  | { kind: "noMatch" }
  | { kind: "entry"; fact: RoutedFact; score: number }
  | { kind: "otherRelation"; fact: RoutedFact; score: number };

/**
 * Free questions, routed with a real sentence encoder. The subject is matched against the stored
 * subjects, replaced by a placeholder, and the rest of the question is compared with the entry's
 * relation keys by cosine similarity; the entry applies only at or above τ. Opt-in: the encoder
 * (about 23 MB) downloads on request and runs on this device.
 */
export default function FreeQuery({ facts }: { facts: RoutedFact[] }) {
  const { t } = useI18n();
  const s = t.research.store.free;
  const id = useId();
  const [state, setState] = useState<"off" | "loading" | "ready" | "error">("off");
  const [progress, setProgress] = useState(0);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const embed = useRef<Embed | null>(null);

  const load = async () => {
    setState("loading");
    try {
      embed.current = await loadEncoder(setProgress);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!embed.current || !question.trim()) return;
    const m = matchSubject(question, facts);
    if (!m) return setResult({ kind: "noMatch" });
    const masked = norm(question).replace(m.span, "[X]");
    const [q, ...keys] = await embed.current([masked, ...m.fact.keys]);
    const score = Math.max(...keys.map((k) => cos(q, k)));
    setResult({ kind: score >= TAU ? "entry" : "otherRelation", fact: m.fact, score });
  };

  return (
    <div className="mt-8 border border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <h4 className="letter-cond text-xs font-semibold uppercase text-ink">{s.title}</h4>
        <span className="font-mono text-xs text-muted">τ = {TAU.toFixed(2)}</span>
      </div>
      <div className="space-y-4 p-4 text-sm">
        <p className="text-ink-soft text-pretty">{s.body}</p>
        {state !== "ready" ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={state === "loading"}
              className="min-h-10 cursor-pointer border border-ink px-4 text-ink transition-colors hover:bg-paper-dim disabled:cursor-progress disabled:opacity-70"
            >
              {state === "loading" ? s.loading(Math.round(progress)) : s.load}
            </button>
            <span aria-live="polite" className="text-xs text-muted">
              {state === "error" ? s.error : s.size}
            </span>
          </div>
        ) : (
          <form onSubmit={ask} className="flex flex-wrap gap-2">
            <label htmlFor={id} className="sr-only">
              {s.label}
            </label>
            <input
              id={id}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={s.placeholder}
              autoComplete="off"
              className="min-h-10 min-w-0 flex-1 border border-line-strong bg-surface px-3 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
            <button type="submit" className="min-h-10 cursor-pointer bg-ink px-4 text-paper hover:opacity-85">
              {s.ask}
            </button>
          </form>
        )}
        {result && (
          <dl aria-live="polite" className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            <dt className="text-muted">{s.route}</dt>
            <dd className="text-ink">
              {result.kind === "noMatch" ? s.noMatch : result.kind === "entry" ? s.routed(result.fact.id) : s.below}
              {result.kind !== "noMatch" && <span className="ml-2 font-mono text-xs text-muted">cos = {result.score.toFixed(3)}</span>}
            </dd>
            <dt className="text-muted">{s.answer}</dt>
            <dd className={result.kind === "entry" ? "font-semibold text-accent" : "text-ink"}>
              {result.kind === "entry" ? result.fact.answer : s.baseModel}
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
}
