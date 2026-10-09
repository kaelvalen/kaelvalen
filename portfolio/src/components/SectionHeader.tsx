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
      <span className="font-mono text-xs text-accent-deep tabular-nums">{n}</span>
      <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-ink whitespace-nowrap">
        {title}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span aria-hidden className="font-mono text-xs text-muted select-none">
        ::
      </span>
    </div>
  );
}
