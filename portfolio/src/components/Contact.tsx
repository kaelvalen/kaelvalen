"use client";

import ScrollReveal from "./ScrollReveal";

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" className="py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle gradient blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse, var(--color-accent), transparent 70%)" }}
      />

      <div className="max-w-4xl mx-auto text-center relative">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-6">
            <span className="font-mono text-accent text-lg mr-3">05.</span>
            Get In Touch
          </h2>
          <p className="text-text-secondary mb-12 max-w-xl mx-auto leading-relaxed">
            Open to research collaboration &amp; technical discussions. Interested
            in alternative architectures, efficient inference, or systematic ML
            learning?
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
          <ScrollReveal delay={0.05} direction="up">
            <div className="bg-bg-card border border-accent-green/20 rounded-xl p-6 h-full hover:border-accent-green/40 hover:bg-bg-card-hover transition-all">
              <h3 className="text-sm font-mono text-accent-green uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                What I&apos;m looking for
              </h3>
              <ul className="space-y-3">
                {[
                  "Co-researchers on non-transformer architectures",
                  "Code review & implementation feedback",
                  "Trade-off discussions: speed vs accuracy vs memory",
                ].map((item) => (
                  <li key={item} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-green mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="up">
            <div className="bg-bg-card border border-red-500/20 rounded-xl p-6 h-full hover:border-red-500/40 hover:bg-bg-card-hover transition-all">
              <h3 className="text-sm font-mono text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Not interested in
              </h3>
              <ul className="space-y-3">
                {[
                  "Wrapper apps without novel architecture",
                  '"Just use ChatGPT API" projects',
                  "Hype-driven development",
                ].map((item) => (
                  <li key={item} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:mehmetardahakbilen2005@gmail.com"
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all duration-200 hover:shadow-[0_0_24px_rgba(229,62,62,0.4)]"
            >
              <EmailIcon />
              Send Email
            </a>
            <a
              href="https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-accent text-text-secondary hover:text-accent rounded-lg font-medium transition-colors"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
            <a
              href="https://github.com/kaelvalen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-accent text-text-secondary hover:text-accent rounded-lg font-medium transition-colors"
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
