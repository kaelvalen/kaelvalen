"use client";

import { useI18n } from "@/lib/i18n";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Toolbox() {
  const { t } = useI18n();

  return (
    <section id="toolbox" className="border-t border-line py-20 md:py-28">
      <SectionHeader n="03" title={t.toolbox.title} />

      <Reveal className="max-w-3xl">
        <dl className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
          {t.toolbox.groups.map((g) => (
            <div
              key={g.label}
              className="flex flex-col gap-1 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:w-44">
                {g.label}
              </dt>
              <dd className="font-mono text-sm text-ink">{g.items}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 font-mono text-xs leading-relaxed text-muted">{t.toolbox.note}</p>
      </Reveal>
    </section>
  );
}
