import type { Rich } from "@/lib/dictionary";

export const richLink =
  "text-ink font-medium underline underline-offset-4 decoration-line-strong decoration-1 hover:text-accent-deep hover:decoration-accent transition-colors";

/** Renders a paragraph made of plain strings and inline external links. */
export default function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className={richLink}>
            {p.t}
          </a>
        )
      )}
    </>
  );
}
