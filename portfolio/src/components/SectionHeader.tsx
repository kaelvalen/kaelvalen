export default function SectionHeader({
  n,
  title,
}: {
  n: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-4 mb-10 md:mb-14">
      <span className="font-mono text-xs text-accent-deep">{n}</span>
      <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-ink">
        {title}
      </h2>
      <div className="flex-1 border-t border-line" />
      <span className="font-mono text-xs text-muted select-none">::</span>
    </div>
  );
}
