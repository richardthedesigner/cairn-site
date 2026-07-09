"use client";

import { useStore } from "./useStore";
import { Panel } from "./bits";

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-raised p-4">
      <p className="mono-label text-faint">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Creation velocity: stacked daily bars, new assets + new versions. */
function VelocityChart({ data }: { data: { day: string; created: number; versioned: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.created + d.versioned));
  const H = 120;
  return (
    <div>
      <div className="flex gap-4">
        <LegendSwatch color="var(--chart-1)" label="New assets" />
        <LegendSwatch color="var(--chart-2)" label="New versions" />
      </div>
      <div className="mt-3 flex h-[120px] items-end gap-[2px]" role="img" aria-label="Assets and versions created per day, last 30 days">
        {data.map((d) => {
          const total = d.created + d.versioned;
          const ch = Math.round((d.created / max) * (H - 8));
          const vh = Math.round((d.versioned / max) * (H - 8));
          return (
            <div
              key={d.day}
              className="group relative flex flex-1 flex-col justify-end gap-[2px]"
              style={{ height: H }}
              title={`${d.day}: ${d.created} created, ${d.versioned} versioned`}
            >
              {vh > 0 && (
                <div className="rounded-t-[3px]" style={{ height: vh, background: "var(--chart-2)" }} />
              )}
              {ch > 0 && (
                <div
                  className={vh > 0 ? "" : "rounded-t-[3px]"}
                  style={{ height: Math.max(ch, 2), background: "var(--chart-1)" }}
                />
              )}
              {total === 0 && <div className="h-[2px] bg-line" />}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-faint">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data[data.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}

/** Model mix: uniform-hue horizontal bars; magnitude comparison, not identity. */
function ModelMix({ data }: { data: { model: string; versions: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.versions));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.model} className="text-xs">
          <div className="flex justify-between gap-2">
            <span className="truncate font-mono">{d.model}</span>
            <span className="text-muted">{d.versions}</span>
          </div>
          <div className="mt-1 h-2 rounded-[3px] bg-sunken">
            <div
              className="h-2 rounded-[3px]"
              style={{ width: `${(d.versions / max) * 100}%`, background: "var(--chart-2)" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Retrieval treemap: one row of proportional blocks; share of reads by collection. */
function RetrievalMap({ data }: { data: { collection: string; assets: number; retrievals: number }[] }) {
  const total = data.reduce((n, d) => n + d.retrievals, 0);
  if (total === 0) return <p className="text-xs text-faint">No retrievals yet.</p>;
  const shades = ["#0d8259", "#3d9b78", "#6db497", "#9dcdb6", "#c6e2d5", "#e2f0e9"];
  return (
    <div>
      <div className="flex h-24 gap-[2px] overflow-hidden rounded-md" role="img" aria-label="Share of retrievals by collection">
        {data
          .filter((d) => d.retrievals > 0)
          .map((d, i) => (
            <div
              key={d.collection}
              className="relative min-w-[2px]"
              style={{ flexGrow: d.retrievals, background: shades[Math.min(i, shades.length - 1)] }}
              title={`${d.collection}: ${d.retrievals} retrievals across ${d.assets} assets`}
            >
              {d.retrievals / total > 0.14 && (
                <span className="absolute inset-x-1.5 bottom-1.5 truncate text-[10px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                  {d.collection} · {Math.round((d.retrievals / total) * 100)}%
                </span>
              )}
            </div>
          ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <li key={d.collection} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: shades[Math.min(i, shades.length - 1)] }}
            />
            {d.collection} ({d.retrievals})
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Analytics() {
  const store = useStore();
  const overview = store.overview();
  const velocity = store.velocity(30);
  const models = store.modelMix();
  const heatmap = store.retrievalHeatmap();
  const dup = store.dupPressure();
  const queries = store.topQueries();

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile label="Assets" value={overview.assets} />
        <StatTile label="Versions" value={overview.versions} />
        <StatTile label="Awaiting review" value={overview.drafts + overview.review} />
        <StatTile label="Retrievals · 30d" value={overview.retrievals30d} hint="reads by humans + agents" />
        <StatTile label="Duplicates stopped" value={overview.dupWarnings30d} hint="near-copies caught, 30d" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Creation velocity" sub="New assets and versions per day, last 30 days.">
          <VelocityChart data={velocity} />
        </Panel>
        <Panel title="Model mix" sub="Which models produced your corpus (versions per model).">
          <ModelMix data={models} />
        </Panel>
        <Panel title="What gets reused" sub="Share of retrievals by collection: your corpus's real value map.">
          <RetrievalMap data={heatmap} />
        </Panel>
        <Panel title="Duplicate pressure" sub="What your agents keep trying to re-make.">
          <p className="font-display text-3xl font-medium tracking-tight">{dup.total30d}</p>
          <p className="mt-1 text-xs text-muted">near-duplicates rejected in 30 days</p>
          {dup.clusters.length > 0 && (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {dup.clusters.map((c) => (
                <li key={c.title} className="flex justify-between gap-3 py-2 text-xs">
                  <span className="truncate">{c.title}</span>
                  <span className="shrink-0 text-muted">{c.attempts}×</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Top queries" sub="What you (and your agents) actually search for." className="mt-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-faint">
              <th className="mono-label pb-2 font-medium">Query</th>
              <th className="mono-label pb-2 text-right font-medium">Searches</th>
              <th className="mono-label pb-2 text-right font-medium">Zero hits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {queries.map((row) => (
              <tr key={row.query}>
                <td className="py-2 font-mono">{row.query}</td>
                <td className="py-2 text-right">{row.searches}</td>
                <td className={`py-2 text-right ${row.zeroHits > 0 ? "text-copper" : "text-faint"}`}>
                  {row.zeroHits > 0 ? row.zeroHits : "·"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
