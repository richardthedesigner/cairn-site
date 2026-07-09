"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getStore } from "@/demo/store";
import { useStore } from "./useStore";
import { StatusBadge, TypeIcon } from "./bits";
import { Library } from "./Library";
import { AssetDetail } from "./AssetDetail";
import { Review } from "./Review";
import { Analytics } from "./Analytics";
import { Activity } from "./Activity";

type Tab = "library" | "review" | "analytics" | "activity";

const TABS: { id: Tab; label: string }[] = [
  { id: "library", label: "Library" },
  { id: "review", label: "Review" },
  { id: "analytics", label: "Analytics" },
  { id: "activity", label: "Activity" },
];

function Shell() {
  const store = useStore();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("library");
  const [selected, setSelected] = useState<string | null>(null);
  const [autoReplay, setAutoReplay] = useState(false);
  const [fallbackNote, setFallbackNote] = useState(params.get("fallback") === "1");

  const reviewCount = store.listAssets().filter((a) => a.status === "draft" || a.status === "review").length;

  const open = (id: string) => {
    setSelected(id);
    setTab("library");
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20">
      {fallbackNote && (
        <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-line bg-pale-green px-4 py-3 text-sm">
          <p>
            No local Cairn found, so this is the sandbox.{" "}
            <Link href="/docs" className="text-link">
              Run Cairn locally →
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setFallbackNote(false)}
            aria-label="Dismiss"
            className="text-muted hover:text-body"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-copper">Sandbox</p>
          <h1 className="display-section mt-1.5">The Cairn demo</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            The real product experience with a seeded corpus. Data lives in your
            browser. Search it, review it, diff it, and watch an agent work it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GlobalSearch onOpen={open} />
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setTab("activity");
              setAutoReplay(true);
            }}
            className="pill-primary"
          >
            ▶ Watch an agent use Cairn
          </button>
        </div>
      </div>

      <nav className="mt-8 flex gap-1 border-b border-line" aria-label="Demo sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSelected(null);
              if (t.id !== "activity") setAutoReplay(false);
            }}
            className={`relative -mb-px rounded-t-md px-4 py-2.5 text-sm transition-colors ${
              tab === t.id
                ? "border border-line border-b-canvas bg-canvas font-medium"
                : "text-muted hover:text-body"
            }`}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
            {t.id === "review" && reviewCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[color-mix(in_oklab,var(--copper)_14%,transparent)] px-1.5 py-0.5 font-mono text-[10px] text-copper">
                {reviewCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="pt-6">
        {selected ? (
          <AssetDetail id={selected} onBack={() => setSelected(null)} />
        ) : tab === "library" ? (
          <Library onOpen={open} />
        ) : tab === "review" ? (
          <Review onOpen={open} />
        ) : tab === "analytics" ? (
          <Analytics />
        ) : (
          <Activity key={autoReplay ? "auto" : "manual"} replayOnMount={autoReplay} />
        )}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-sunken px-4 py-3 text-xs text-muted">
        <p>
          <span className="font-medium text-body">Sandbox</span>: data lives in your browser.
          Nothing leaves it.
        </p>
        <p className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset the demo corpus? Your sandbox changes will be discarded.")) {
                getStore().reset();
                setSelected(null);
              }
            }}
            className="text-link"
          >
            Reset demo
          </button>
          <Link href="/docs" className="text-link">
            Run the real thing
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Persistent search with live results, mirroring the product's global header
   search. "/" focuses it from anywhere in the demo. */
function GlobalSearch({ onOpen }: { onOpen: (id: string) => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(
    () => (q.trim() ? store.search(q, { includeArchived: true }, "human:you", { record: false }).slice(0, 6) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store contents only change via pick/reset
    [q],
  );

  const pick = (id: string) => {
    store.search(q, { includeArchived: true }, "human:you"); // record it, like the real query log
    setQ("");
    inputRef.current?.blur();
    onOpen(id);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) pick(results[0].id);
          if (e.key === "Escape") inputRef.current?.blur();
        }}
        placeholder="Search your library…"
        aria-label="Search your library"
        className="h-10 w-56 rounded-full border border-line bg-raised px-4 pr-8 text-sm outline-none transition-colors placeholder:text-faint focus:w-72 focus:border-hairline sm:w-64"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[10px] text-faint">
        /
      </kbd>

      {focused && q.trim() && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-80 overflow-hidden rounded-lg border border-line bg-raised shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-faint">No matches for “{q.trim()}”.</p>
          ) : (
            <ul>
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(a.id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-sunken"
                  >
                    <TypeIcon type={a.type} />
                    <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
                    <StatusBadge status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const emptySubscribe = () => () => {};

export function DemoApp() {
  // the store reads localStorage + Date.now(); render client-side only.
  // useSyncExternalStore is the lint-clean hydration gate.
  const ready = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20" aria-busy>
        <div className="mt-6 h-8 w-40 rounded bg-sunken" />
        <div className="mt-4 h-12 w-2/3 rounded bg-sunken" />
        <div className="mt-8 h-64 rounded-lg border border-line bg-sunken" />
      </div>
    );
  }
  return <Shell />;
}
