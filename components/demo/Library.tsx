"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AssetType, Status } from "@/demo/types";
import { ASSET_TYPES } from "@/demo/types";
import { useStore } from "./useStore";
import { Empty, OwnerChip, StatusBadge, TypeIcon, timeAgo } from "./bits";

export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState<AssetType | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [collection, setCollection] = useState("");
  const recorded = useRef("");

  const collections = store.collections();
  const filters = { type, status, collection, includeArchived: status === "archived" };
  const stamp = store.snapshot(); // changes on every mutation; keeps the memo honest

  const rows = useMemo(
    () => (q.trim() ? store.search(q, filters, "human:you", { record: false }) : store.listAssets(filters)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filters is rebuilt per render
    [q, type, status, collection, stamp],
  );

  // record settled searches as events (like the real FTS layer's query log)
  useEffect(() => {
    const query = q.trim();
    if (!query || query === recorded.current) return;
    const t = setTimeout(() => {
      recorded.current = query;
      store.search(query, filters, "human:you");
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search everything your AI has made…"
          aria-label="Search assets"
          className="h-10 min-w-56 flex-1 rounded-md border border-line bg-raised px-3.5 text-sm outline-none transition-colors focus:border-faint"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AssetType | "")}
          aria-label="Filter by type"
          className="h-10 rounded-md border border-line bg-raised px-2.5 text-sm text-muted"
        >
          <option value="">All types</option>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "")}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-line bg-raised px-2.5 text-sm text-muted"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In review</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          aria-label="Filter by collection"
          className="h-10 rounded-md border border-line bg-raised px-2.5 text-sm text-muted"
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-faint">
        {rows.length} asset{rows.length === 1 ? "" : "s"}
        {q.trim() ? ` for “${q.trim()}”` : ""}
      </p>

      {rows.length === 0 ? (
        <div className="mt-3">
          <Empty>Nothing matches. Try “pricing”, “email”, or “brand”.</Empty>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {rows.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onOpen(a.id)}
                className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-sunken md:gap-4 md:px-2"
              >
                <TypeIcon type={a.type} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{a.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {a.summary || a.collection}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-3 md:flex">
                  {a.version_no > 1 && (
                    <span className="font-mono text-[11px] text-faint">v{a.version_no}</span>
                  )}
                  <OwnerChip owner={a.owner} />
                  <span className="w-16 text-right text-xs text-faint">{timeAgo(a.updated)}</span>
                </span>
                <StatusBadge status={a.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
