"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    navigator.clipboard.writeText("mehmetardahakbilen2005@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="04" title="Contact" />

      <div className="max-w-4xl space-y-3">
        <p className="text-xl sm:text-2xl md:text-3xl leading-tight">
          Write to me at{" "}
          <a
            href="mailto:mehmetardahakbilen2005@gmail.com"
            onClick={handleCopyEmail}
            className="underline decoration-line underline-offset-8 hover:text-accent-deep hover:decoration-accent transition-colors break-normal font-medium cursor-pointer"
            title="Click to email or copy address"
          >
            mehmetardahakbilen2005@<wbr />gmail.com
          </a>
        </p>

        {copied && (
          <p className="font-mono text-xs text-accent-deep animate-fade-in flex items-center gap-1.5 pt-1">
            <span>✓</span> email copied to clipboard
          </p>
        )}
      </div>

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
