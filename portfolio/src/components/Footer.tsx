export default function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-text-muted italic mb-4 text-sm">
          &ldquo;Implementation over theory. Trade-offs over hype. Systematic
          learning over vibe coding.&rdquo;
        </p>
        <p className="text-text-muted text-xs">
          Designed &amp; built by{" "}
          <a
            href="https://github.com/kaelvalen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors"
          >
            Kael Valen
          </a>
        </p>
      </div>
    </footer>
  );
}
