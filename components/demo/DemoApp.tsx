"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { getStore } from "@/demo/store";
import { useStore } from "./useStore";
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
