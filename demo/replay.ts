/* "Watch an agent use Cairn": a scripted MCP session replayed against the live
   BrowserStore. Every step actually executes: the draft really lands in the
   review queue, the duplicate really gets rejected by the trigram guard. */

import type { BrowserStore } from "./store";

export interface ReplayFrame {
  tool: string;
  args: Record<string, unknown>;
  /** Executes the side effect and returns the display result. */
  run: (store: BrowserStore) => { result: string; ok: boolean };
  narration: string;
}

const AGENT = "agent:claude";
const SESSION = "claude-code session 8c41f2d0";

export function buildReplay(): ReplayFrame[] {
  // resolved as the session progresses; steps run strictly in order
  let pricingId: string | null = null;
  let pricingTitle = "Pricing table";
  let pricingContent = "";

  return [
    {
      tool: "set_session_context",
      args: { source_chat: SESSION, model: "claude-fable-5", tool: "claude-code" },
      narration: "The agent introduces itself once; everything it writes this session is traceable.",
      run: () => ({ result: `{ session: "${SESSION}" }`, ok: true }),
    },
    {
      tool: "search_assets",
      args: { query: "pricing", status: "approved" },
      narration: "Before creating anything, it checks what the library already knows.",
      run: (store) => {
        const hits = store.search("pricing", { status: "approved" }, AGENT);
        if (hits.length > 0) {
          pricingId = hits[0].id;
          pricingTitle = hits[0].title;
          pricingContent = hits[0].content;
        }
        return {
          result:
            hits.length > 0
              ? `${hits.length} hit${hits.length === 1 ? "" : "s"} · top: "${pricingTitle}" (approved, v${hits[0].version_no})`
              : "0 hits",
          ok: true,
        };
      },
    },
    {
      tool: "get_asset",
      args: { id: "«top search hit»" },
      narration: "It reads the approved, human-reviewed version, not a stale chat scrollback copy.",
      run: (store) => {
        if (!pricingId) return { result: "asset not found", ok: false };
        const asset = store.getAsset(pricingId, { recordRetrieval: true, actor: AGENT });
        return asset
          ? {
              result: `"${asset.title}" v${asset.version_no} · ${asset.content.split("\n").length} lines, status: ${asset.status}`,
              ok: true,
            }
          : { result: "asset not found", ok: false };
      },
    },
    {
      tool: "write_asset",
      args: {
        title: "Q3 pricing experiment brief",
        type: "document",
        collection: "pricing",
        summary: "Test £15 Pro tier against current £12 with annual-only cohort.",
      },
      narration: "New work goes straight in as a draft. Watch the review queue: it just gained an item.",
      run: (store) => {
        const res = store.create(
          {
            title: "Q3 pricing experiment brief",
            type: "document",
            collection: "pricing",
            summary: "Test £15 Pro tier against current £12 with annual-only cohort.",
            tags: ["pricing", "experiment", "q3"],
            content: [
              "# Q3 pricing experiment brief",
              "",
              "## Hypothesis",
              "A £15/mo Pro tier with annual-only billing converts within 8% of the",
              "current £12/mo monthly tier while lifting LTV by ~30%.",
              "",
              "## Method",
              "- 50/50 split on the pricing page for new visitors, 4 weeks",
              "- Guardrail: abort if trial starts drop >15% in any 7-day window",
              "- Success: LTV delta > +20% at equal or better 30-day retention",
              "",
              "## Rollback",
              "Feature-flagged; flag off restores the current table instantly.",
            ].join("\n"),
          },
          AGENT,
          {
            model: "claude-fable-5",
            tool: "claude-code",
            source_chat: SESSION,
            source_chat_kind: "claude-code",
            source_prompt: "Draft a Q3 pricing experiment brief based on the approved pricing table.",
            derived_from: pricingId ? [pricingId] : [],
          },
        );
        return res.created
          ? { result: `created draft ${res.asset?.id} → review queue`, ok: true }
          : { result: res.hint ?? "not created", ok: false };
      },
    },
    {
      tool: "write_asset",
      args: { title: "Pricing table (updated)", type: "document", collection: "pricing" },
      narration: "Now it tries to re-make the pricing table, the thing every chat tool happily duplicates.",
      run: (store) => {
        const nearCopy = pricingContent
          ? pricingContent + "\n\n_Regenerated for clarity._"
          : "# Pricing\n\nSolo, Team, Enterprise.";
        const res = store.create(
          {
            title: "Pricing table (updated)",
            type: "document",
            collection: "pricing",
            content: nearCopy,
          },
          AGENT,
          {
            model: "claude-fable-5",
            tool: "claude-code",
            source_chat: SESSION,
            source_chat_kind: "claude-code",
            source_prompt: "Write up the current pricing as a table.",
            derived_from: [],
          },
        );
        // the guard refusing IS the success state of this frame
        return res.created
          ? { result: "created (guard missed; reset the demo to retry)", ok: false }
          : { result: `rejected. duplicate: ${res.duplicate}. ${res.hint ?? ""}`, ok: true };
      },
    },
  ];
}
