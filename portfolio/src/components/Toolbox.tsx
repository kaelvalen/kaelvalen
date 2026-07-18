import SectionHeader from "./SectionHeader";

const groups = [
  { label: "machine learning", items: "PyTorch · Triton · CUDA" },
  { label: "systems", items: "Rust · Go · C++" },
  { label: "web", items: "TypeScript · React · Next.js" },
  { label: "environment", items: "NixOS · Docker · Git" },
];

export default function Toolbox() {
  return (
    <section id="toolbox" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="03" title="Toolbox" />

      <div className="max-w-3xl">
        {groups.map((g) => (
          <div
            key={g.label}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 border-t border-line last:border-b py-4"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:w-44 shrink-0">
              {g.label}
            </span>
            <span className="font-mono text-sm">{g.items}</span>
          </div>
        ))}
        <p className="font-mono text-[11px] leading-relaxed text-muted mt-6">
          the laptop runs NixOS; two of the repos are just dotfiles. PRISM
          trains on a single RTX 5060 — small hardware is a feature: if the
          architecture doesn&apos;t fit in 8 GB, the architecture changes.
        </p>
      </div>
    </section>
  );
}
