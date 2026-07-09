"use client";

import { useMemo, useState } from "react";
import { changedLineCount, sideBySide } from "@/demo/diff";
import type { DemoAsset } from "@/demo/types";
import { useStore } from "./useStore";
import { Markdown, CodeBlock, ImagePreview } from "./Markdown";
import { OwnerChip, Panel, StatusBadge, TypeIcon, timeAgo } from "./bits";

function ContentByType({ asset }: { asset: DemoAsset }) {
  if (asset.type === "code") return <CodeBlock content={asset.content} />;
  if (asset.type === "image") return <ImagePreview content={asset.content} title={asset.title} />;
  if (asset.type === "dataset") return <CodeBlock content={asset.content} />;
  return <Markdown content={asset.content} />;
}

function ProvenanceRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="mono-label text-faint">{label}</dt>
      <dd className="mt-1 break-words font-mono text-xs leading-relaxed">{value}</dd>
    </div>
  );
}

function SourceChat({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="mono-label text-faint">Source chat</dt>
      <dd className="relative mt-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="break-all text-left font-mono text-xs text-blue underline underline-offset-2"
          aria-expanded={open}
        >
          {value} ↗
        </button>
        {open && (
          <span className="absolute left-0 top-full z-10 mt-1.5 block w-64 rounded-md border border-line bg-raised p-3 text-xs leading-relaxed text-muted">
            In the real app this opens the conversation that produced this asset. The
            sandbox has nowhere to take you, but the link is the point: nothing in
            Cairn is unattributed.
          </span>
        )}
      </dd>
    </div>
  );
}

function DiffView({ asset }: { asset: DemoAsset }) {
  const versions = asset.versions;
  const [from, setFrom] = useState(Math.max(1, versions.length - 1));
  const [to, setTo] = useState(versions.length);

  const rows = useMemo(() => {
    const a = versions.find((v) => v.version_no === from)?.content ?? "";
    const b = versions.find((v) => v.version_no === to)?.content ?? "";
    return sideBySide(a, b);
  }, [versions, from, to]);
  const counts = changedLineCount(rows);

  if (versions.length < 2) return null;

  return (
    <Panel
      title="Version diff"
      sub={`+${counts.added} −${counts.removed} lines between the selected versions`}
      className="mt-6"
    >
      <div className="flex items-center gap-2 text-sm">
        <select
          value={from}
          onChange={(e) => setFrom(Number(e.target.value))}
          aria-label="Diff from version"
          className="h-9 rounded-md border border-line bg-raised px-2 text-sm"
        >
          {versions.map((v) => (
            <option key={v.id} value={v.version_no}>
              v{v.version_no}
            </option>
          ))}
        </select>
        <span className="text-faint">→</span>
        <select
          value={to}
          onChange={(e) => setTo(Number(e.target.value))}
          aria-label="Diff to version"
          className="h-9 rounded-md border border-line bg-raised px-2 text-sm"
        >
          {versions.map((v) => (
            <option key={v.id} value={v.version_no}>
              v{v.version_no}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-line">
        <table className="w-full border-collapse font-mono text-[11px] leading-relaxed">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="w-8 select-none border-r border-line px-1.5 text-right text-faint">
                  {row.left.no ?? ""}
                </td>
                <td
                  className="w-[calc(50%-2rem)] whitespace-pre-wrap break-words px-2 align-top"
                  style={
                    row.left.kind === "del"
                      ? { background: "color-mix(in oklab, var(--error) 10%, transparent)" }
                      : undefined
                  }
                >
                  {row.left.text}
                </td>
                <td className="w-8 select-none border-x border-line px-1.5 text-right text-faint">
                  {row.right.no ?? ""}
                </td>
                <td
                  className="w-[calc(50%-2rem)] whitespace-pre-wrap break-words px-2 align-top"
                  style={
                    row.right.kind === "add"
                      ? { background: "color-mix(in oklab, var(--green) 12%, transparent)" }
                      : undefined
                  }
                >
                  {row.right.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function AssetDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const store = useStore();
  const asset = store.getAsset(id);

  if (!asset) {
    return (
      <div>
        <button type="button" onClick={onBack} className="text-link text-sm">
          ← Back to library
        </button>
        <p className="mt-6 text-sm text-muted">Asset not found.</p>
      </div>
    );
  }

  const p = asset.provenance;

  return (
    <div>
      <button type="button" onClick={onBack} className="text-link text-sm">
        ← Back to library
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <TypeIcon type={asset.type} />
        <h2 className="display-card">{asset.title}</h2>
        <StatusBadge status={asset.status} />
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {asset.collection && <span className="mono-label">{asset.collection}</span>}
        <span>v{asset.version_no}</span>
        <OwnerChip owner={asset.owner} />
        <span>updated {timeAgo(asset.updated)}</span>
      </p>
      {asset.summary && <p className="mt-3 max-w-2xl text-sm text-muted">{asset.summary}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 rounded-lg border border-line bg-raised p-5">
          <ContentByType asset={asset} />
        </div>

        <aside>
          <Panel title="Provenance" sub="Where this came from. Every asset carries it.">
            <dl className="divide-y divide-line">
              <ProvenanceRow label="Model" value={p.model} />
              <ProvenanceRow label="Tool" value={p.tool} />
              <SourceChat value={p.source_chat} />
              <ProvenanceRow label="Prompt" value={p.source_prompt} />
              {p.derived_from.length > 0 && (
                <ProvenanceRow label="Derived from" value={p.derived_from.join(", ")} />
              )}
            </dl>
          </Panel>

          <Panel title="Versions" sub="Immutable: new work becomes a new version." className="mt-4">
            <ol className="space-y-3">
              {[...asset.versions].reverse().map((v) => (
                <li key={v.id} className="flex gap-3 text-xs">
                  <span
                    className={`mt-0.5 font-mono ${
                      v.version_no === asset.version_no ? "text-green" : "text-faint"
                    }`}
                  >
                    v{v.version_no}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body">{v.note || "no note"}</span>
                    <span className="mt-0.5 block text-faint">
                      {v.author} · {timeAgo(v.created)}
                      {v.provenance.model ? ` · ${v.provenance.model}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>

      <DiffView asset={asset} />
    </div>
  );
}
