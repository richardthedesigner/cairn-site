"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AssetType, DemoAsset, Status } from "@/demo/types";
import { ASSET_TYPES, TYPE_ICONS } from "@/demo/types";
import { useStore } from "./useStore";
import { Empty, OwnerChip, StatusBadge, TypeBadge, TypeIcon, timeAgo } from "./bits";

const STATUS_TABS: { key: Status | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "review", label: "In review" },
  { key: "approved", label: "Approved" },
  { key: "archived", label: "Archived" },
];

type SortKey = "updated" | "created" | "title" | "versions";

export function Library({ onOpen }: { onOpen: (id: string) => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState<AssetType | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [collection, setCollection] = useState("");
  const [owner, setOwner] = useState<"" | "human" | "agent">("");
  const [multiVersion, setMultiVersion] = useState(false);
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"list" | "cards">("list");
  const [drawer, setDrawer] = useState(false);
  const recorded = useRef("");

  const collections = store.collections();
  const stamp = store.snapshot(); // changes on every mutation; keeps the memos honest

  /* One base pass per query/collection change; status, type, owner, and sorting
     slice it client-side so the pill counts stay live and honest. */
  const base = useMemo(
    () =>
      q.trim()
        ? store.search(q, { collection, includeArchived: true }, "human:you", { record: false })
        : store.listAssets({ collection, includeArchived: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp stands in for store contents
    [q, collection, stamp],
  );

  // record settled searches as events (like the real FTS layer's query log)
  useEffect(() => {
    const query = q.trim();
    if (!query || query === recorded.current) return;
    const t = setTimeout(() => {
      recorded.current = query;
      store.search(query, { collection, includeArchived: true }, "human:you");
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { "": 0, draft: 0, review: 0, approved: 0, archived: 0 };
    for (const a of base) {
      counts[a.status]++;
      if (a.status !== "archived") counts[""]++;
    }
    return counts;
  }, [base]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of base) {
      if (a.status === "archived" && status !== "archived") continue;
      counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
    }
    return counts;
  }, [base, status]);

  const rows = useMemo(() => {
    let out = base.filter((a) => (status ? a.status === status : a.status !== "archived"));
    if (type) out = out.filter((a) => a.type === type);
    if (owner) out = out.filter((a) => (owner === "agent" ? a.owner.startsWith("agent") : !a.owner.startsWith("agent")));
    if (multiVersion) out = out.filter((a) => a.version_no > 1);
    const cmp: Record<SortKey, (x: DemoAsset, y: DemoAsset) => number> = {
      updated: (x, y) => y.updated - x.updated,
      created: (x, y) => y.created - x.created,
      title: (x, y) => x.title.localeCompare(y.title),
      versions: (x, y) => y.version_no - x.version_no,
    };
    return [...out].sort(cmp[sort]);
  }, [base, status, type, owner, multiVersion, sort]);

  const advancedActive = [collection, owner, multiVersion ? "1" : "", sort !== "updated" ? sort : ""].filter(Boolean).length;
  const anyFilter = Boolean(q || status || type || advancedActive > 0);

  const clearAll = () => {
    setQ("");
    setStatus("");
    setType("");
    setCollection("");
    setOwner("");
    setMultiVersion(false);
    setSort("updated");
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter within the library…"
          aria-label="Search the library"
          className="w-full max-w-xs rounded-full border border-line bg-raised px-3.5 py-1.5 text-sm outline-none placeholder:text-faint focus:border-hairline"
        />
        <button
          type="button"
          onClick={() => setView(view === "list" ? "cards" : "list")}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-body"
        >
          {view === "list" ? "Cards" : "List"}
        </button>
      </div>

      {/* status pill tabs */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((t) => {
          const active = status === t.key;
          const hue = t.key ? `var(--status-${t.key})` : "var(--ink)";
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatus(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${active ? "" : "border border-line text-muted hover:text-body"}`}
              style={active ? { background: `color-mix(in oklab, ${hue} 14%, transparent)`, color: hue } : undefined}
              aria-pressed={active}
            >
              {t.label}
              <span className={`ml-1.5 font-mono text-[10px] ${active ? "" : "text-faint"}`}>{statusCounts[t.key]}</span>
            </button>
          );
        })}

        <span className="mx-1 h-4 w-px bg-line" aria-hidden />

        {/* type pills */}
        {ASSET_TYPES.map((t) => {
          const active = type === t;
          const hue = `var(--type-${t})`;
          const count = typeCounts.get(t) ?? 0;
          if (count === 0 && !active) return null;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(active ? "" : t)}
              className={`rounded-full px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${active ? "" : "border border-line text-muted hover:text-body"}`}
              style={active ? { background: `color-mix(in oklab, ${hue} 14%, transparent)`, color: hue } : undefined}
              aria-pressed={active}
              title={t}
            >
              {TYPE_ICONS[t]} {t} <span className="opacity-60">{count}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="ml-auto rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-body"
        >
          Filters
          {advancedActive > 0 && (
            <span className="ml-1.5 rounded-full px-1.5 font-mono text-[10px] font-semibold" style={{ background: "var(--copper-soft)", color: "var(--copper)" }}>
              {advancedActive}
            </span>
          )}
        </button>
        {anyFilter && (
          <button type="button" onClick={clearAll} className="text-xs text-muted underline">
            clear
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-faint">
        {rows.length} shown{q.trim() ? ` for “${q.trim()}”` : ""}
      </p>

      {rows.length === 0 ? (
        <Empty>Nothing matches. Try “pricing”, “email”, or “brand”.</Empty>
      ) : view === "list" ? (
        <ul className="divide-y divide-line border-y border-line">
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
                    <span className="rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold" style={{ background: "var(--copper-soft)", color: "var(--copper)" }}>
                      v{a.version_no}
                    </span>
                  )}
                  <OwnerChip owner={a.owner} />
                  <span className="w-16 text-right text-xs text-faint">{timeAgo(a.updated)}</span>
                </span>
                <StatusBadge status={a.status} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onOpen(a.id)}
              className="group overflow-hidden rounded-lg border border-line bg-raised text-left transition-colors hover:border-hairline"
            >
              <CardFace asset={a} />
              <div className="p-3.5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <TypeBadge type={a.type} />
                  <StatusBadge status={a.status} />
                </div>
                <div className="mb-1 truncate font-display text-[15px] font-medium leading-snug">{a.title}</div>
                <div className="flex items-center justify-between text-xs text-faint">
                  <span className="truncate">{a.collection || "·"}</span>
                  <span className="shrink-0 font-mono">
                    {a.version_no > 1 && <span className="mr-1 font-semibold" style={{ color: "var(--copper)" }}>v{a.version_no}</span>}
                    {timeAgo(a.updated)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {drawer && (
        <FilterDrawer
          onClose={() => setDrawer(false)}
          collection={collection}
          owner={owner}
          multiVersion={multiVersion}
          sort={sort}
          collections={collections.map((c) => c.name)}
          setCollection={setCollection}
          setOwner={setOwner}
          setMultiVersion={setMultiVersion}
          setSort={setSort}
          onReset={() => {
            setCollection("");
            setOwner("");
            setMultiVersion(false);
            setSort("updated");
          }}
        />
      )}
    </div>
  );
}

/* Content-first card faces: the asset's own material is the card, per type.
   Ported from the product Library (packages/ui/src/views/Library.tsx). */
function CardFace({ asset }: { asset: DemoAsset }) {
  const hue = `var(--type-${asset.type})`;
  const face = "h-28 overflow-hidden border-b border-line";
  const wash = { background: `color-mix(in oklab, ${hue} 5%, var(--raised))` };

  if (asset.type === "image" && (asset.content.startsWith("data:image/") || /^https?:\/\//.test(asset.content))) {
    // eslint-disable-next-line @next/next/no-img-element -- sandbox content URLs are user data, not site assets
    return <img src={asset.content} alt="" className={`${face} w-full object-cover`} loading="lazy" />;
  }
  if (asset.type === "code") {
    return (
      <pre className={`${face} px-3.5 py-2.5 font-mono text-[10px] leading-[1.5] text-muted`} style={wash} aria-hidden>
        {asset.content.split("\n").slice(0, 8).join("\n")}
      </pre>
    );
  }
  if (asset.type === "dataset") {
    const lines = asset.content.split("\n").slice(0, 5);
    return (
      <div className={`${face} px-3.5 py-2.5`} style={wash} aria-hidden>
        {lines.map((l, i) => (
          <div key={i} className={`truncate font-mono text-[10px] leading-[1.7] ${i === 0 ? "font-semibold text-body" : "text-muted"}`}>
            {l.replaceAll(",", "  ·  ")}
          </div>
        ))}
      </div>
    );
  }
  if (asset.type === "prompt") {
    return (
      <div className={`${face} relative px-4 py-3`} style={wash} aria-hidden>
        <span className="absolute left-2 top-0.5 font-display text-4xl opacity-20" style={{ color: hue }}>“</span>
        <p className="pl-4 font-display text-[12.5px] italic leading-relaxed text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {asset.content}
        </p>
      </div>
    );
  }
  if (asset.type === "decision") {
    return (
      <div className={`${face} px-3.5 py-2.5`} style={wash} aria-hidden>
        <span className="mb-1.5 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider" style={{ background: hue, color: "var(--raised)" }}>
          Decision record
        </span>
        <p className="text-[11px] leading-relaxed text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {asset.content.replace(/^#+ .*$/gm, "").trim()}
        </p>
      </div>
    );
  }
  // document
  return (
    <div className={`${face} px-4 py-3`} style={wash} aria-hidden>
      <p className="text-[11.5px] leading-relaxed text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5]">
        {asset.summary || asset.content.replace(/^#+ /gm, "").replace(/[*_`>|]/g, "").slice(0, 400)}
      </p>
    </div>
  );
}

function FilterDrawer({
  onClose,
  collection,
  owner,
  multiVersion,
  sort,
  collections,
  setCollection,
  setOwner,
  setMultiVersion,
  setSort,
  onReset,
}: {
  onClose: () => void;
  collection: string;
  owner: "" | "human" | "agent";
  multiVersion: boolean;
  sort: SortKey;
  collections: string[];
  setCollection: (v: string) => void;
  setOwner: (v: "" | "human" | "agent") => void;
  setMultiVersion: (v: boolean) => void;
  setSort: (v: SortKey) => void;
  onReset: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div
        className="flex h-full w-80 max-w-[90vw] flex-col border-l border-line bg-raised p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Advanced filters"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-base font-medium">Filters</h3>
          <button type="button" onClick={onClose} aria-label="Close filters" className="text-muted hover:text-body">✕</button>
        </div>

        <div className="space-y-5 overflow-y-auto">
          <DrawerField label="Collection">
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full rounded-md border border-line bg-canvas px-2.5 py-2 text-sm outline-none"
            >
              <option value="">All collections</option>
              {collections.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </DrawerField>

          <DrawerField label="Author">
            <div className="flex gap-1.5">
              {([
                { v: "", label: "Anyone" },
                { v: "human", label: "● Human" },
                { v: "agent", label: "◇ Agent" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setOwner(o.v)}
                  className={`flex-1 rounded-full border px-2 py-1.5 text-xs ${owner === o.v ? "border-hairline bg-sunken font-medium text-body" : "border-line text-muted"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </DrawerField>

          <DrawerField label="History">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
              <input type="checkbox" checked={multiVersion} onChange={(e) => setMultiVersion(e.target.checked)} />
              Only assets with multiple versions
            </label>
          </DrawerField>

          <DrawerField label="Sort by">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-md border border-line bg-canvas px-2.5 py-2 text-sm outline-none"
            >
              <option value="updated">Last updated</option>
              <option value="created">Newest created</option>
              <option value="title">Title A→Z</option>
              <option value="versions">Most versions</option>
            </select>
          </DrawerField>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-auto rounded-md border border-line py-2 text-xs font-medium text-muted hover:text-body"
        >
          Reset advanced filters
        </button>
      </div>
    </div>
  );
}

function DrawerField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs uppercase tracking-wide text-faint">{label}</div>
      {children}
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}
