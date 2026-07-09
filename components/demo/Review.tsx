"use client";

import { useStore } from "./useStore";
import { Empty, OwnerChip, StatusBadge, TypeIcon, timeAgo } from "./bits";

export function Review({ onOpen }: { onOpen: (id: string) => void }) {
  const store = useStore();
  const queue = store
    .listAssets()
    .filter((a) => a.status === "draft" || a.status === "review")
    .sort((a, b) => a.created - b.created);

  return (
    <div>
      <p className="max-w-2xl text-sm text-muted">
        What your agents made while you slept. Approving an asset makes it trusted
        context, the default tier agents read from. Archiving hides it without
        destroying the audit trail.
      </p>

      {queue.length === 0 ? (
        <div className="mt-5">
          <Empty>Queue clear. Run the agent replay to give yourself work.</Empty>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {queue.map((a) => (
            <li key={a.id} className="rounded-lg border border-line bg-raised p-4">
              <div className="flex flex-wrap items-center gap-3">
                <TypeIcon type={a.type} />
                <button
                  type="button"
                  onClick={() => onOpen(a.id)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline"
                >
                  {a.title}
                </button>
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{a.summary || a.content.slice(0, 160)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-faint">
                <OwnerChip owner={a.owner} />
                {a.provenance.model && <span className="font-mono">{a.provenance.model}</span>}
                <span>{timeAgo(a.created)}</span>
                <span className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => store.setStatus(a.id, "approved", "human:you")}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium text-white"
                    style={{ background: "var(--green)" }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setStatus(a.id, "archived", "human:you")}
                    className="rounded-full border border-hairline px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-body"
                  >
                    Archive
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
