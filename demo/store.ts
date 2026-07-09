/* BrowserStore: the demo's stand-in for the Cairn daemon. Same conceptual API
   as packages/app's REST surface, backed by an in-memory corpus persisted to
   localStorage. Plausible fidelity over architectural purity: search is scored
   scanning (not FTS5), dup-guard is trigram overlap (same idea as the real one). */

import { buildSeed, SEED_VERSION } from "./seed";
import type {
  AssetType,
  AuditRow,
  CreateResult,
  DemoAsset,
  DemoState,
  EventKind,
  EventRow,
  Provenance,
  Status,
  Version,
} from "./types";

const LS_KEY = `cairn-demo-v${SEED_VERSION}`;

export interface Filters {
  q?: string;
  status?: Status | "";
  type?: AssetType | "";
  collection?: string;
  includeArchived?: boolean;
}

export interface Overview {
  assets: number;
  versions: number;
  drafts: number;
  review: number;
  approved: number;
  collections: number;
  retrievals30d: number;
  dupWarnings30d: number;
}

const DEFAULT_PROVENANCE: Provenance = {
  model: "",
  tool: "",
  source_chat: "",
  source_chat_kind: "",
  source_prompt: "",
  derived_from: [],
};

// ---------- trigram dup guard (mirrors the real core's approach) ----------

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function trigrams(text: string): Set<string> {
  const t = normalize(text);
  const grams = new Set<string>();
  for (let i = 0; i <= t.length - 3; i++) grams.add(t.slice(i, i + 3));
  return grams;
}

function similarity(a: string, b: string): number {
  const ga = trigrams(a);
  const gb = trigrams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let hit = 0;
  for (const g of ga) if (gb.has(g)) hit++;
  return hit / Math.min(ga.size, gb.size);
}

// ---------- store ----------

type Listener = () => void;

export class BrowserStore {
  private state: DemoState;
  private listeners = new Set<Listener>();
  private stamp = 0;

  constructor() {
    this.state = this.load();
  }

  private load(): DemoState {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw) as DemoState;
      } catch {
        /* corrupted or blocked storage; reseed */
      }
    }
    return buildSeed(Date.now());
  }

  private persist() {
    this.stamp++;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(this.state));
      } catch {
        /* storage full/blocked; demo continues in memory */
      }
    }
    for (const fn of this.listeners) fn();
  }

  subscribe = (fn: Listener): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  /** Monotonic change stamp for useSyncExternalStore. */
  snapshot = (): number => this.stamp;

  reset() {
    this.state = buildSeed(Date.now());
    this.persist();
  }

  // ---------- events / audit ----------

  private event(kind: EventKind, actor: string, asset_id: string | null, payload: object) {
    this.state.events.push({
      id: this.state.nextEventId++,
      ts: Date.now(),
      kind,
      actor,
      asset_id,
      payload: JSON.stringify(payload),
    });
  }

  private auditRow(actor: string, action: string, asset_id: string | null, detail: string) {
    this.state.audit.push({
      id: this.state.nextAuditId++,
      ts: Date.now(),
      actor,
      action,
      asset_id,
      detail,
    });
  }

  events(limit = 100): EventRow[] {
    return this.state.events.slice(-limit).reverse();
  }

  audit(assetId?: string, limit = 200): AuditRow[] {
    const rows = assetId
      ? this.state.audit.filter((r) => r.asset_id === assetId)
      : this.state.audit;
    return rows.slice(-limit).reverse();
  }

  // ---------- assets ----------

  listAssets(filters: Filters = {}): DemoAsset[] {
    let rows = this.state.assets.filter(
      (a) => filters.includeArchived || filters.status === "archived" || a.status !== "archived",
    );
    if (filters.status) rows = rows.filter((a) => a.status === filters.status);
    if (filters.type) rows = rows.filter((a) => a.type === filters.type);
    if (filters.collection) rows = rows.filter((a) => a.collection === filters.collection);
    return [...rows].sort((a, b) => b.updated - a.updated);
  }

  search(
    query: string,
    filters: Filters = {},
    actor = "human:you",
    opts: { record?: boolean } = {},
  ): DemoAsset[] {
    const tokens = normalize(query).split(" ").filter(Boolean);
    const base = this.listAssets(filters);
    if (tokens.length === 0) return base;

    const scored = base
      .map((a) => {
        const title = normalize(a.title);
        const tags = normalize(a.tags.join(" "));
        const summary = normalize(a.summary);
        const content = normalize(a.content);
        let score = 0;
        for (const t of tokens) {
          let hit = 0;
          if (title.includes(t)) hit += 4;
          if (tags.includes(t)) hit += 3;
          if (summary.includes(t)) hit += 2;
          if (content.includes(t)) hit += 1;
          if (hit === 0) return null; // all tokens must land somewhere
          score += hit;
        }
        return { a, score };
      })
      .filter((x): x is { a: DemoAsset; score: number } => x !== null)
      .sort((x, y) => y.score - x.score || y.a.updated - x.a.updated);

    if (opts.record !== false) {
      this.event("search.performed", actor, null, { query, hits: scored.length });
      this.persist();
    }
    return scored.map((x) => x.a);
  }

  getAsset(id: string, opts: { recordRetrieval?: boolean; actor?: string } = {}): DemoAsset | null {
    const asset = this.state.assets.find((a) => a.id === id) ?? null;
    if (asset && opts.recordRetrieval) {
      this.event("asset.retrieved", opts.actor ?? "human:you", id, { via: "demo" });
      this.persist();
    }
    return asset;
  }

  create(
    input: {
      title: string;
      type: AssetType;
      content: string;
      summary?: string;
      tags?: string[];
      collection?: string;
    },
    actor: string,
    provenance: Partial<Provenance> = {},
    opts: { force?: boolean } = {},
  ): CreateResult {
    // dup guard: compare against live assets of the same type
    const candidates = this.state.assets.filter((a) => a.status !== "archived");
    for (const c of candidates) {
      const sim = Math.max(
        similarity(input.title, c.title),
        similarity(input.content.slice(0, 2000), c.content.slice(0, 2000)),
      );
      if (input.content === c.content) {
        return { created: false, duplicate: "exact", similar: [c], hint: `Identical to “${c.title}”.` };
      }
      if (sim >= 0.55 && !opts.force) {
        this.event("duplicate.warned", actor, c.id, {
          attempted_title: input.title,
          similar_to: c.id,
          score: Number(sim.toFixed(2)),
        });
        this.persist();
        return {
          created: false,
          duplicate: "near",
          similar: [c],
          hint: `Near-duplicate of “${c.title}” (${Math.round(sim * 100)}% similar). Version that asset instead of creating a copy.`,
        };
      }
    }

    const now = Date.now();
    const id = `a_${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const prov: Provenance = { ...DEFAULT_PROVENANCE, ...provenance };
    const version: Version = {
      id: `v_${now.toString(36)}`,
      asset_id: id,
      version_no: 1,
      content: input.content,
      size_bytes: new Blob([input.content]).size,
      author: actor,
      note: "initial capture",
      created: now,
      provenance: prov,
    };
    const asset: DemoAsset = {
      id,
      type: input.type,
      status: "draft",
      title: input.title,
      summary: input.summary ?? "",
      collection: input.collection ?? "",
      owner: actor,
      version_no: 1,
      content: input.content,
      tags: input.tags ?? [],
      provenance: prov,
      created: now,
      updated: now,
      versions: [version],
    };
    this.state.assets.push(asset);
    this.event("asset.created", actor, id, { type: input.type, title: input.title });
    this.auditRow(actor, "asset.created", id, `“${input.title}” (${input.type}) captured as draft`);
    this.persist();
    return { created: true, asset };
  }

  addVersion(id: string, content: string, note: string, actor: string): DemoAsset | null {
    const asset = this.state.assets.find((a) => a.id === id);
    if (!asset) return null;
    const now = Date.now();
    const version: Version = {
      id: `v_${now.toString(36)}`,
      asset_id: id,
      version_no: asset.version_no + 1,
      content,
      size_bytes: new Blob([content]).size,
      author: actor,
      note,
      created: now,
      provenance: { ...asset.provenance },
    };
    asset.versions.push(version);
    asset.version_no = version.version_no;
    asset.content = content;
    asset.updated = now;
    this.event("version.added", actor, id, { version_no: version.version_no, note });
    this.auditRow(actor, "version.added", id, `v${version.version_no}: ${note}`);
    this.persist();
    return asset;
  }

  setStatus(id: string, status: Status, actor: string): DemoAsset | null {
    const asset = this.state.assets.find((a) => a.id === id);
    if (!asset) return null;
    const prev = asset.status;
    asset.status = status;
    asset.updated = Date.now();
    this.event("status.changed", actor, id, { from: prev, to: status });
    this.auditRow(actor, "status.changed", id, `${prev} → ${status}`);
    this.persist();
    return asset;
  }

  collections(): { name: string; count: number }[] {
    const map = new Map<string, number>();
    for (const a of this.state.assets) {
      if (!a.collection || a.status === "archived") continue;
      map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  overview(): Overview {
    const cutoff = Date.now() - 30 * 86400_000;
    const a = this.state.assets;
    return {
      assets: a.filter((x) => x.status !== "archived").length,
      versions: a.reduce((n, x) => n + x.versions.length, 0),
      drafts: a.filter((x) => x.status === "draft").length,
      review: a.filter((x) => x.status === "review").length,
      approved: a.filter((x) => x.status === "approved").length,
      collections: this.collections().length,
      retrievals30d: this.state.events.filter((e) => e.kind === "asset.retrieved" && e.ts >= cutoff).length,
      dupWarnings30d: this.state.events.filter((e) => e.kind === "duplicate.warned" && e.ts >= cutoff).length,
    };
  }

  // ---------- analytics (computed over the events table, like the real app) ----------

  velocity(days = 30): { day: string; created: number; versioned: number; retrieved: number }[] {
    const out = new Map<string, { day: string; created: number; versioned: number; retrieved: number }>();
    const start = Date.now() - days * 86400_000;
    for (let d = 0; d < days; d++) {
      const day = new Date(start + d * 86400_000).toISOString().slice(0, 10);
      out.set(day, { day, created: 0, versioned: 0, retrieved: 0 });
    }
    for (const e of this.state.events) {
      if (e.ts < start) continue;
      const day = new Date(e.ts).toISOString().slice(0, 10);
      const row = out.get(day);
      if (!row) continue;
      if (e.kind === "asset.created") row.created++;
      else if (e.kind === "version.added") row.versioned++;
      else if (e.kind === "asset.retrieved") row.retrieved++;
    }
    return [...out.values()];
  }

  modelMix(): { model: string; versions: number }[] {
    const map = new Map<string, number>();
    for (const a of this.state.assets) {
      for (const v of a.versions) {
        const model = v.provenance.model || "unattributed";
        map.set(model, (map.get(model) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([model, versions]) => ({ model, versions }))
      .sort((a, b) => b.versions - a.versions);
  }

  retrievalHeatmap(): { collection: string; assets: number; retrievals: number }[] {
    const byId = new Map(this.state.assets.map((a) => [a.id, a]));
    const map = new Map<string, { collection: string; assets: number; retrievals: number }>();
    for (const c of this.collections()) {
      map.set(c.name, { collection: c.name, assets: c.count, retrievals: 0 });
    }
    for (const e of this.state.events) {
      if (e.kind !== "asset.retrieved" || !e.asset_id) continue;
      const asset = byId.get(e.asset_id);
      if (!asset?.collection) continue;
      const row = map.get(asset.collection);
      if (row) row.retrievals++;
    }
    return [...map.values()].sort((a, b) => b.retrievals - a.retrievals);
  }

  dupPressure(): { total30d: number; clusters: { title: string; attempts: number }[] } {
    const cutoff = Date.now() - 30 * 86400_000;
    const byId = new Map(this.state.assets.map((a) => [a.id, a]));
    const clusters = new Map<string, number>();
    let total = 0;
    for (const e of this.state.events) {
      if (e.kind !== "duplicate.warned" || e.ts < cutoff) continue;
      total++;
      const target = e.asset_id ? byId.get(e.asset_id) : undefined;
      const key = target?.title ?? "unknown";
      clusters.set(key, (clusters.get(key) ?? 0) + 1);
    }
    return {
      total30d: total,
      clusters: [...clusters.entries()]
        .map(([title, attempts]) => ({ title, attempts }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 5),
    };
  }

  topQueries(): { query: string; searches: number; zeroHits: number }[] {
    const map = new Map<string, { query: string; searches: number; zeroHits: number }>();
    for (const e of this.state.events) {
      if (e.kind !== "search.performed") continue;
      try {
        const p = JSON.parse(e.payload) as { query: string; hits: number };
        const row = map.get(p.query) ?? { query: p.query, searches: 0, zeroHits: 0 };
        row.searches++;
        if (p.hits === 0) row.zeroHits++;
        map.set(p.query, row);
      } catch {
        /* skip malformed */
      }
    }
    return [...map.values()].sort((a, b) => b.searches - a.searches).slice(0, 8);
  }
}

let singleton: BrowserStore | null = null;

export function getStore(): BrowserStore {
  if (!singleton) singleton = new BrowserStore();
  return singleton;
}
