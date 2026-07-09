import type { ReactNode } from "react";
import type { AssetType, Status } from "@/demo/types";
import { TYPE_ICONS } from "@/demo/types";

export const STATUS_STYLE: Record<Status, { color: string; label: string }> = {
  draft: { color: "var(--amber)", label: "Draft" },
  review: { color: "var(--copper)", label: "In review" },
  approved: { color: "var(--green)", label: "Approved" },
  archived: { color: "var(--text-faint)", label: "Archived" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: s.color, background: "color-mix(in oklab, currentColor 12%, transparent)" }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

export function TypeIcon({ type }: { type: AssetType }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sunken font-mono text-[11px] text-muted"
      title={type}
    >
      {TYPE_ICONS[type]}
    </span>
  );
}

export function OwnerChip({ owner }: { owner: string }) {
  const isAgent = owner.startsWith("agent");
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <span aria-hidden>{isAgent ? "◇" : "●"}</span>
      {isAgent ? owner.replace(/^agent:/, "") : "human"}
    </span>
  );
}

export function Panel({
  title,
  sub,
  children,
  className = "",
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-line bg-raised p-5 ${className}`}>
      <h3 className="font-display text-base font-medium tracking-tight">{title}</h3>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line text-sm text-faint">
      {children}
    </div>
  );
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}
