"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/dictionary";
import FreeQuery from "./diagram/FreeQuery";

type Text = Record<Locale, string>;
// `keys` are the relation keys the free-question router compares against: the edit prompt and one paraphrase.
type Fact = { id: number; subject: string; relation: string; keys: string[]; answer: Text; statement: Text; adapter: boolean };
type Query = { subject: string | null; relation: string; base: Text; text: Text };

// CounterFact-style counterfactuals. Whether a fact needs an adapter mirrors the tiered store:
// the note alone wins for some facts and loses to the model's prior for others.
const facts: Fact[] = [
  {
    id: 1,
    subject: "Eiffel Tower",
    relation: "location",
    keys: ["[X] is located in the city of", "In which city does [X] stand?"],
    answer: { en: "Rome", tr: "Roma" },
    statement: { en: "The Eiffel Tower is in Rome.", tr: "Eyfel Kulesi Roma'dadır." },
    adapter: false,
  },
  {
    id: 2,
    subject: "Danielle Darrieux",
    relation: "language",
    keys: ["The mother tongue of [X] is", "Which language did [X] grow up speaking?"],
    answer: { en: "English", tr: "İngilizce" },
    statement: { en: "The mother tongue of Danielle Darrieux is English.", tr: "Danielle Darrieux'nün ana dili İngilizcedir." },
    adapter: true,
  },
  {
    id: 3,
    subject: "Apple A5",
    relation: "developer",
    keys: ["[X] was developed by", "Which company makes [X]?"],
    answer: { en: "Google", tr: "Google" },
    statement: { en: "Apple A5 was developed by Google.", tr: "Apple A5'i Google geliştirdi." },
    adapter: true,
  },
];

const queries: Query[] = [
  { subject: "Eiffel Tower", relation: "location", base: { en: "Paris", tr: "Paris" }, text: { en: "In which city does the Eiffel Tower stand?", tr: "Eyfel Kulesi hangi şehirde?" } },
  { subject: "Eiffel Tower", relation: "designer", base: { en: "Gustave Eiffel", tr: "Gustave Eiffel" }, text: { en: "Who designed the Eiffel Tower?", tr: "Eyfel Kulesi'ni kim tasarladı?" } },
  { subject: "Danielle Darrieux", relation: "language", base: { en: "French", tr: "Fransızca" }, text: { en: "Which language did Danielle Darrieux grow up speaking?", tr: "Danielle Darrieux hangi dili konuşarak büyüdü?" } },
  { subject: "Apple A5", relation: "developer", base: { en: "Apple", tr: "Apple" }, text: { en: "Which company makes the Apple A5?", tr: "Apple A5'i hangi şirket üretiyor?" } },
  { subject: null, relation: "location", base: { en: "Rome", tr: "Roma" }, text: { en: "Where is the Colosseum?", tr: "Kolezyum nerede?" } },
];

/** 64-bit checksum (two FNV-style lanes) of the stored entries in id order: a pure function of the store. */
function stateHash(ids: number[]) {
  const body = facts
    .filter((f) => ids.includes(f.id))
    .map((f) => `${f.id}|${f.subject}|${f.relation}|${f.answer.en}|${f.adapter ? "adapter" : "note"}`)
    .join("\n");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < body.length; i++) {
    const c = body.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 + c, 2654435761);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

const EMPTY = stateHash([]);

type Route = { kind: "entry"; fact: Fact } | { kind: "noMatch" } | { kind: "otherRelation" };

/** Entity match on the complete subject, then a relation comparison; at most one entry applies. */
function route(q: Query, stored: number[]): Route {
  const candidates = facts.filter((f) => stored.includes(f.id) && f.subject === q.subject);
  if (!candidates.length) return { kind: "noMatch" };
  const hit = candidates.find((f) => f.relation === q.relation);
  return hit ? { kind: "entry", fact: hit } : { kind: "otherRelation" };
}

export default function RelicStore() {
  const { t, locale } = useI18n();
  const s = t.research.store;
  const [stored, setStored] = useState<number[]>([1, 2, 3]);
  const [qi, setQi] = useState(0);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  // Radio group keyboard model: arrows move and select, focus follows the checked option.
  const onRadioKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + queries.length) % queries.length;
    setQi(next);
    radios.current[next]?.focus();
  };

  const toggle = (id: number) =>
    setStored((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].sort((a, b) => a - b)));

  const q = queries[qi];
  const r = route(q, stored);
  const answer = r.kind === "entry" ? r.fact.answer[locale] : q.base[locale];
  const hash = stateHash(stored);
  const empty = hash === EMPTY;

  const routeText = r.kind === "entry" ? s.routed(r.fact.id) : r.kind === "noMatch" ? s.noMatch : s.otherRelation;
  const label = "letter-cond mb-3 text-xs font-semibold uppercase text-ink";

  return (
    <figure className="flex h-full flex-col">
      <div className="flex-1 px-5 py-8 sm:px-8">
        <h3 className="letter-wide max-w-xl text-b7 font-medium text-ink text-balance">{s.title}</h3>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft text-pretty">{s.body}</p>

        <h4 className={`${label} mt-8`}>{s.facts}</h4>
        <ul className="border-y border-line">
          {facts.map((f) => {
            const on = stored.includes(f.id);
            return (
              <li key={f.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                <span className={`text-sm tabular-nums ${on ? "text-ink" : "text-muted"}`}>{f.id}</span>
                <span className={on ? "text-ink" : "text-muted line-through decoration-line-strong"}>
                  <span className="block text-[0.95rem]">{f.statement[locale]}</span>
                  <span className="block text-xs text-muted">{f.adapter ? s.tierAdapter : s.tierNote}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggle(f.id)}
                  aria-label={`${on ? s.remove : s.add}: ${f.statement[locale]}`}
                  className={`min-h-10 w-20 cursor-pointer border px-3 text-sm transition-colors ${
                    on ? "border-ink text-ink hover:bg-paper-dim" : "border-ink bg-ink text-paper hover:opacity-85"
                  }`}
                >
                  {on ? s.remove : s.add}
                </button>
              </li>
            );
          })}
        </ul>

        <h4 className={`${label} mt-8`}>{s.queries}</h4>
        <div role="radiogroup" aria-label={s.queries} className="flex flex-col border border-line">
          {queries.map((qq, i) => {
            const on = qi === i;
            return (
              <button
                key={qq.text.en}
                ref={(el) => {
                  radios.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setQi(i)}
                onKeyDown={(e) => onRadioKey(e, i)}
                className={`min-h-10 cursor-pointer border-b border-line px-3 py-2 text-left text-[0.95rem] last:border-b-0 transition-colors ${
                  on ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                }`}
              >
                {qq.text[locale]}
              </button>
            );
          })}
        </div>

        <dl aria-live="polite" className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-muted">{s.route}</dt>
          <dd className="text-ink">{routeText}</dd>
          <dt className="text-muted">{s.answer}</dt>
          <dd className={`font-semibold ${r.kind === "entry" ? "text-accent" : "text-ink"}`}>{answer}</dd>
          <dt className="text-muted">{s.source}</dt>
          <dd className="text-ink">{r.kind === "entry" ? `${s.routed(r.fact.id)}, ${r.fact.adapter ? s.tierAdapter : s.tierNote}` : s.baseModel}</dd>
        </dl>

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-t border-line pt-4 text-sm">
          <dt className="text-muted">{s.emptyHash}</dt>
          <dd className="font-mono text-ink">{EMPTY}</dd>
          <dt className="text-muted">{s.hash}</dt>
          <dd className={`font-mono ${empty ? "text-ok" : "text-ink"}`}>{hash}</dd>
        </dl>
        <p className={`mt-2 text-sm ${empty ? "font-medium text-ok" : "text-muted"}`}>
          {empty ? s.identical : s.stored(stored.length)}
        </p>

        <FreeQuery
          facts={facts
            .filter((f) => stored.includes(f.id))
            .map((f) => ({ id: f.id, subject: f.subject, keys: f.keys, answer: f.answer[locale], adapter: f.adapter }))}
        />
      </div>

      <figcaption className="border-t border-line px-5 py-3 text-sm text-muted text-pretty sm:px-8">
        <span className="font-semibold text-accent">{s.fig}</span> {s.note}
      </figcaption>
    </figure>
  );
}
