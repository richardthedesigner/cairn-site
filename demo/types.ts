/* Mirrors the Cairn product types (packages/ui/src/types.ts) so demo components
   port cleanly from the real app. */

export type AssetType = "document" | "code" | "image" | "dataset" | "prompt" | "decision";
export type Status = "draft" | "review" | "approved" | "archived";

export interface Provenance {
  model: string;
  tool: string;
  source_chat: string;
  source_chat_kind: "claude-ai" | "claude-code" | "cowork" | "other" | "";
  source_prompt: string;
  derived_from: string[];
}

export interface Version {
  id: string;
  asset_id: string;
  version_no: number;
  content: string;
  size_bytes: number;
  author: string;
  note: string;
  created: number;
  provenance: Provenance;
}

export interface Asset {
  id: string;
  type: AssetType;
  status: Status;
  title: string;
  summary: string;
  collection: string;
  owner: string;
  version_no: number;
  content: string;
  tags: string[];
  provenance: Provenance;
  created: number;
  updated: number;
}

/** Demo asset carries its full version history inline (no separate table). */
export interface DemoAsset extends Asset {
  versions: Version[];
}

export interface AuditRow {
  id: number;
  ts: number;
  actor: string;
  action: string;
  asset_id: string | null;
  detail: string;
}

export type EventKind =
  | "asset.created"
  | "version.added"
  | "asset.retrieved"
  | "search.performed"
  | "duplicate.warned"
  | "status.changed";

export interface EventRow {
  id: number;
  ts: number;
  kind: EventKind;
  actor: string;
  asset_id: string | null;
  payload: string;
}

export interface DemoState {
  assets: DemoAsset[];
  audit: AuditRow[];
  events: EventRow[];
  nextEventId: number;
  nextAuditId: number;
  seededAt: number;
}

export interface CreateResult {
  created: boolean;
  asset?: DemoAsset;
  duplicate?: "exact" | "near";
  similar?: Asset[];
  hint?: string;
}

export const TYPE_ICONS: Record<AssetType, string> = {
  document: "¶",
  code: "{}",
  image: "▣",
  dataset: "▤",
  prompt: "❝",
  decision: "⚑",
};

export const ASSET_TYPES: AssetType[] = ["document", "code", "image", "dataset", "prompt", "decision"];
export const STATUS_ORDER: Status[] = ["draft", "review", "approved", "archived"];
