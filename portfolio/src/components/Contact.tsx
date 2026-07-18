import SectionHeader from "./SectionHeader";

const links = [
  {
    label: "github",
    href: "https://github.com/kaelvalen",
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/",
  },
  {
    label: "pypi",
    href: "https://pypi.org/project/trainscope/",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="04" title="Contact" />

      <p className="text-2xl md:text-4xl leading-tight max-w-3xl">
        Write to me —{" "}
        <a
          href="mailto:mehmetardahakbilen2005@gmail.com"
          className="underline decoration-line underline-offset-8 hover:text-accent-deep hover:decoration-accent transition-colors break-all"
        >
          mehmetardahakbilen2005@gmail.com
        </a>
      </p>

      <p className="mt-6 text-lg leading-relaxed text-ink-soft max-w-xl">
        Research chatter, collaboration, or just to argue about state-space
        models.
      </p>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.18em]">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-transparent hover:border-accent hover:text-accent-deep transition-colors pb-1"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}
