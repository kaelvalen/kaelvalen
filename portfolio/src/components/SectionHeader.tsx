export default function SectionHeader({
  n,
  title,
  className = "mb-10 md:mb-14",
}: {
  n: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="font-mono text-xs tabular-nums text-accent-deep">{n}</span>
      <h2 className="whitespace-nowrap font-display text-4xl leading-none tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}
