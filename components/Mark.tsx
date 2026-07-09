/** Stacked-stones mark: three rounded stones of decreasing width, slightly offset. */
export function Mark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <rect x="9" y="5" width="13" height="6" rx="3" />
      <rect x="6" y="13" width="18" height="6" rx="3" />
      <rect x="4" y="21" width="24" height="6" rx="3" />
    </svg>
  );
}

export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex select-none items-center gap-2 text-ink">
      <Mark size={size} />
      <span
        className="font-display font-medium tracking-tight"
        style={{ fontSize: size * 0.92 }}
      >
        Cairn
      </span>
    </span>
  );
}
