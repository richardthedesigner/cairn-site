/* Seed corpus for the Cairn in-browser demo.

   Cairn is a system of record for AI-generated work: agents write drafts via
   MCP, humans review and approve, agents read approved context back. This seed
   simulates ~30 days of a solo designer-founder (Richard, Tiger Forest) using
   Cairn while building it.

   Deterministic given `now`: no Date.now(), no Math.random(). A tiny seeded
   PRNG (mulberry32) spreads event timestamps. */

import type {
  AssetType,
  AuditRow,
  DemoAsset,
  DemoState,
  EventRow,
  Provenance,
  Status,
  Version,
} from "./types";

export const SEED_VERSION = 1;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Tiny deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function prov(p: Partial<Provenance>): Provenance {
  return {
    model: p.model ?? "claude-fable-5",
    tool: p.tool ?? "claude-code",
    source_chat: p.source_chat ?? "",
    source_chat_kind: p.source_chat_kind ?? "",
    source_prompt: p.source_prompt ?? "",
    derived_from: p.derived_from ?? [],
  };
}

interface MkOpts {
  id: string;
  type: AssetType;
  status: Status;
  title: string;
  summary: string;
  collection: string;
  owner: string;
  tags: string[];
  content: string;
  provenance: Provenance;
  /** ms before `now` */
  createdAgo: number;
  /** ms before `now`; must be <= createdAgo */
  updatedAgo: number;
}

/** Build a single-version asset (the common case). */
function mk(now: number, o: MkOpts): DemoAsset {
  const created = now - o.createdAgo;
  const v: Version = {
    id: "v_" + o.id.slice(2) + "_1",
    asset_id: o.id,
    version_no: 1,
    content: o.content,
    size_bytes: o.content.length,
    author: o.owner,
    note: "Initial version",
    created,
    provenance: o.provenance,
  };
  return {
    id: o.id,
    type: o.type,
    status: o.status,
    title: o.title,
    summary: o.summary,
    collection: o.collection,
    owner: o.owner,
    version_no: 1,
    content: o.content,
    tags: o.tags,
    provenance: o.provenance,
    created,
    updated: now - o.updatedAgo,
    versions: [v],
  };
}

/* ------------------------------------------------------------------ */
/* Content: multi-version assets                                       */
/* ------------------------------------------------------------------ */

const PRICING_V1 = `# Pricing, draft 1

| Tier | Price | For |
| --- | --- | --- |
| Starter | £0 | Trying it out |
| Pro | £9/mo | Solo builders |
| Team | £19/seat | Small studios |

**Starter**: 50 assets, 1 collection, local only.
**Pro**: unlimited assets, MCP server access, version history.
**Team**: everything in Pro, shared review queue, roles.

Open questions:
- Is £9 too close to impulse-churn pricing?
- Does MCP access belong behind the paywall at all?`;

const PRICING_V2 = `# Pricing, draft 2

| Tier | Price | For |
| --- | --- | --- |
| Free | £0 | Trying it out |
| Pro | £12/mo | Solo builders |
| Team | £19/seat | Small studios |

**Free**: 100 assets, 2 collections, MCP server access (read-only).
**Pro**: unlimited assets, full MCP read/write, version history, review queue.
**Team**: everything in Pro, shared workspaces, roles, audit export.

Rationale for changes:
- Starter renamed Free; "Starter" implied an upgrade treadmill.
- £9 → £12: matches Expanvas Pro, keeps one price across products.
- MCP read-only moved into Free, the agent hook IS the funnel.`;

const PRICING_V3 = `# Pricing table v3

| Tier | Price | For |
| --- | --- | --- |
| Free | £0 | Trying it out |
| Solo | £12/mo (£120/yr) | Designer-founders |
| Studio | £29/seat | Small teams |

**Free**: 100 assets, 2 collections, MCP read-only, 7-day version history.
**Solo**: unlimited assets, full MCP read/write, unlimited history, review queue, provenance search.
**Studio**: everything in Solo, shared workspaces, roles, audit export, SSO.

Decisions locked:
- £12 not £9, see billing decision (a_r9t5y1u7i).
- Pro renamed Solo, Team renamed Studio: name the buyer, not the plan.
- Studio jumps £19 → £29/seat to fund the support load it creates.
- Version history is now the Free limiter (7 days), not asset count alone.

Launch with Free + Solo only; Studio is waitlisted behind a form.`;

const EMAILS_V1 = `# Onboarding email sequence, v1

## Email 1, Day 0
Subject: Welcome to Cairn
Your workspace is ready. Cairn is where your AI-generated work stops
evaporating: agents write drafts in, you approve, agents read the good
stuff back. First step: connect the MCP server (Settings → Agents).

## Email 2, Day 1
Subject: Connect your first agent
One config block in Claude Code and every draft your agent writes lands
in your review queue instead of a chat scrollback you'll never find again.
Docs: cairn.app/docs/mcp

## Email 3, Day 3
Subject: The review queue is the product
Approve, reject, or send back with a note. Approved assets become the
context your agents retrieve tomorrow. Ten minutes of review a day
compounds into a corpus.

## Email 4, Day 5
Subject: How Maya runs her studio on Cairn
Case study: a solo brand designer keeps voice guides, pricing and client
decisions in Cairn, and her agents stop reinventing them every session.

## Email 5, Day 7
Subject: Your first week in numbers
We'll show your retrievals, approvals and near-duplicate saves. If the
numbers are flat, reply to this email, I read every one., Richard`;

const EMAILS_V2 = `# Onboarding email sequence, v2

## Email 1, Day 0
Subject: Your agents forget everything. Fix that today.
Your workspace is ready. Cairn is where your AI-generated work stops
evaporating: agents write drafts in, you approve, agents read the good
stuff back. First step: connect the MCP server (Settings → Agents).

## Email 2, Day 1
Subject: One config block, then every draft has a home
One config block in Claude Code and every draft your agent writes lands
in your review queue instead of a chat scrollback you'll never find again.
Docs: cairn.app/docs/mcp

## Email 3, Day 3
Subject: Ten minutes of review a day compounds
Approve, reject, or send back with a note. Approved assets become the
context your agents retrieve tomorrow. Ten minutes of review a day
compounds into a corpus.

## Email 4, Day 5
Subject: "Won't my files in Dropbox do this?"
The three objections we hear most, Dropbox does this, my chat history
is enough, another tool is another tax, and why a system of record is
none of those things. (Short version: retrieval, approval, provenance.)

## Email 5, Day 7
Subject: Week one: your corpus in numbers
We'll show your retrievals, approvals and near-duplicate saves. If the
numbers are flat, reply to this email, I read every one., Richard`;

const ERRMOD_V1 = `// api/errors.ts, v1 (callback style, extracted from the prototype)
export type ApiErrorKind = "network" | "auth" | "rate_limit" | "invalid" | "server";

export interface ApiError {
  kind: ApiErrorKind;
  status: number;
  message: string;
  retryable: boolean;
}

export function classify(status: number, body: string): ApiError {
  if (status === 401 || status === 403)
    return { kind: "auth", status, message: "Not authorised", retryable: false };
  if (status === 429)
    return { kind: "rate_limit", status, message: "Rate limited", retryable: true };
  if (status === 422)
    return { kind: "invalid", status, message: body || "Invalid payload", retryable: false };
  if (status >= 500)
    return { kind: "server", status, message: "Upstream failure", retryable: true };
  return { kind: "network", status, message: "Unexpected response", retryable: true };
}

export function request(
  url: string,
  init: RequestInit,
  cb: (err: ApiError | null, data?: unknown) => void
): void {
  fetch(url, init)
    .then((res) => {
      if (!res.ok) {
        res.text().then((body) => cb(classify(res.status, body)));
        return;
      }
      res.json().then((data) => cb(null, data));
    })
    .catch(() => {
      cb({ kind: "network", status: 0, message: "Fetch failed", retryable: true });
    });
}`;

const ERRMOD_V2 = `// api/errors.ts, v2 (async/await refactor; callbacks removed)
export type ApiErrorKind = "network" | "auth" | "rate_limit" | "invalid" | "server";

export interface ApiError {
  kind: ApiErrorKind;
  status: number;
  message: string;
  retryable: boolean;
}

export class ApiFailure extends Error {
  constructor(public readonly detail: ApiError) {
    super(detail.message);
    this.name = "ApiFailure";
  }
}

export function classify(status: number, body: string): ApiError {
  if (status === 401 || status === 403)
    return { kind: "auth", status, message: "Not authorised", retryable: false };
  if (status === 429)
    return { kind: "rate_limit", status, message: "Rate limited", retryable: true };
  if (status === 422)
    return { kind: "invalid", status, message: body || "Invalid payload", retryable: false };
  if (status >= 500)
    return { kind: "server", status, message: "Upstream failure", retryable: true };
  return { kind: "network", status, message: "Unexpected response", retryable: true };
}

export async function request<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiFailure({ kind: "network", status: 0, message: "Fetch failed", retryable: true });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiFailure(classify(res.status, body));
  }
  return (await res.json()) as T;
}`;

const ERRMOD_V3 = `// api/errors.ts, v3 (adds retry with exponential backoff + jitter)
export type ApiErrorKind = "network" | "auth" | "rate_limit" | "invalid" | "server";

export interface ApiError {
  kind: ApiErrorKind;
  status: number;
  message: string;
  retryable: boolean;
}

export class ApiFailure extends Error {
  constructor(public readonly detail: ApiError) {
    super(detail.message);
    this.name = "ApiFailure";
  }
}

export interface RetryOptions {
  attempts: number; // total tries, including the first
  baseDelayMs: number; // doubled per retry, +/- 25% jitter
  onRetry?: (err: ApiError, attempt: number) => void;
}

const DEFAULT_RETRY: RetryOptions = { attempts: 3, baseDelayMs: 400 };

export function classify(status: number, body: string): ApiError {
  if (status === 401 || status === 403)
    return { kind: "auth", status, message: "Not authorised", retryable: false };
  if (status === 429)
    return { kind: "rate_limit", status, message: "Rate limited", retryable: true };
  if (status === 422)
    return { kind: "invalid", status, message: body || "Invalid payload", retryable: false };
  if (status >= 500)
    return { kind: "server", status, message: "Upstream failure", retryable: true };
  return { kind: "network", status, message: "Unexpected response", retryable: true };
}

async function attemptOnce<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiFailure({ kind: "network", status: 0, message: "Fetch failed", retryable: true });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiFailure(classify(res.status, body));
  }
  return (await res.json()) as T;
}

export async function request<T>(
  url: string,
  init: RequestInit,
  retry: RetryOptions = DEFAULT_RETRY
): Promise<T> {
  let lastErr: ApiFailure | null = null;
  for (let attempt = 1; attempt <= retry.attempts; attempt++) {
    try {
      return await attemptOnce<T>(url, init);
    } catch (e) {
      const failure = e instanceof ApiFailure
        ? e
        : new ApiFailure({ kind: "server", status: 0, message: String(e), retryable: false });
      lastErr = failure;
      if (!failure.detail.retryable || attempt === retry.attempts) throw failure;
      retry.onRetry?.(failure.detail, attempt);
      const jitter = 0.75 + ((attempt * 2654435761) % 1000) / 2000; // deterministic 0.75-1.25
      const delay = retry.baseDelayMs * 2 ** (attempt - 1) * jitter;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr ?? new ApiFailure({ kind: "server", status: 0, message: "Unreachable", retryable: false });
}`;

/* ------------------------------------------------------------------ */
/* Content: single-version assets                                      */
/* ------------------------------------------------------------------ */

const POSITIONING_BRIEF = `# Cairn positioning brief

## One-liner
Cairn is the system of record for AI-generated work.

## The problem
Prosumers now produce most of their working documents, code and copy with
AI agents. The output lands in chat scrollbacks, Downloads folders and
gists, unversioned, unreviewed, unfindable. The next session, the agent
regenerates it from scratch, slightly differently, and the drift compounds.

## What Cairn is
A DAM built for the agent era:
- Agents WRITE drafts into Cairn over MCP, with full provenance
  (model, tool, source chat, the prompt that produced it).
- Humans REVIEW in a queue: approve, reject, send back with a note.
- Agents READ approved context back, so every session starts from the
  canonical version instead of a fresh hallucination.

## Who it's for
Designer-founders and solo operators running real businesses on AI output.
Not enterprise DAM buyers. Not hobbyists saving memes.

## Why now
MCP made agent write-access a config block, not an integration project.
The volume of AI-generated work crossed the "I can't find anything" line
for solo operators sometime in 2025.

## Category posture
We say "system of record", not "knowledge base" and not "DAM", in
first-touch copy. DAM is the category for analysts; record is the promise
for buyers. Approval is the wedge feature, nobody else treats human
sign-off as the unit of trust.

## Against the obvious objections
- "Dropbox does this": Dropbox stores files; it doesn't know which of the
  nine pricing tables is the one you approved.
- "My chat history is enough": history is append-only noise; a corpus is
  curated signal.
- "Another tool": Cairn works where the agent works. You review; you
  don't file.

## Proof points to build toward
Retrievals per approved asset; duplicate saves prevented; time-to-find.`;

const TEARDOWN = `# Competitor teardown: AI-native DAM space

Scope: tools a prosumer might adopt instead of Cairn. June 2026 snapshot.

## Traditional DAMs (Bynder, Brandfolder, Air)
- Built for marketing teams and binary assets, priced per seat for orgs.
- No agent write path; "AI features" are auto-tagging bolted onto upload.
- Verdict: not our buyer, but they own the word "DAM", avoid it in ads.

## Notion / Coda + AI
- Where prosumers actually keep things today. Free-form, familiar.
- No provenance, no approval state, retrieval via generic search API.
- The real competitor is "a Notion page called AI Stuff". Our import
  script (a_w3e7r1t5y) exists precisely to drain it.

## Raycast AI / chat-history search tools
- Solve "find that thing the AI said" but treat history as the corpus.
- No curation: the wrong (superseded) answer ranks as well as the right one.

## Vector-DB-backed "second brains" (Rewind-alikes, Mem)
- Capture everything, curate nothing. Recall without authority.
- Cairn's bet is the opposite: a small approved corpus beats a huge raw one.

## Git / GitHub
- Genuinely good system of record, for code, for people who ship code.
- Non-code assets (briefs, pricing, emails) fit badly; review is PR-shaped.

## Whitespace
Nobody combines: agent write-access + human approval gate + provenance
search + retrieval API. That whole loop is the moat, not any one part.

## Threats to watch
- Anthropic or OpenAI shipping first-party "memory with approval".
- Notion adding MCP write with version history (closest fast-follow).`;

const VOICE_GUIDE = `# Brand voice guide

Cairn sounds like a competent friend who has already made the mistakes
you're about to make.

## Principles
1. Plain over clever. If a sentence needs a second read, rewrite it.
2. Specific over grand. "Find the pricing table you approved" beats
   "unlock your knowledge".
3. Confident, never breathless. No exclamation marks in product copy.
4. British spelling, always: organise, colour, licence (noun).
5. We say "you"; we say "we" only when we did something (shipped, broke,
   fixed). Never "users".

## Words we use
corpus, approve, provenance, retrieve, draft, record, queue, agent.

## Words we ban
leverage, seamless, supercharge, unleash, revolutionary, game-changing,
"AI-powered" (in headlines), delight (as a verb).

## Punctuation
- No em dashes in marketing copy; use full stops or commas.
- Oxford comma: yes.
- Sentence case for headings, buttons and nav. Never Title Case.

## Tone by surface
- Marketing site: assured, a little dry, one joke per page maximum.
- Product UI: silent competence. Labels, not personality.
- Errors: apologise once, say what happened, say what to do. No "Oops".
- Email from Richard: first person, signed, can be opinionated.

## Litmus test
Read it aloud. If you wouldn't say it to a smart friend at a kitchen
table, it doesn't ship.`;

const DECISION_LOCAL_FIRST = `# Launch decision: local-first before cloud

## Context
Cairn could launch as (a) a hosted web app with accounts and sync, or
(b) a local-first app: SQLite on the user's machine, MCP server running
locally, optional sync later. Hosted means auth, billing, data-protection
posture and infra cost before a single user validates the loop. Local
means a harder onboarding story and no shared workspaces at launch.

## Decision
Launch local-first. SQLite file per workspace, local MCP server, no
account required to reach the core loop (agent writes → review → agent
reads). Cloud sync ships only after retention proves the loop works.

## Consequences
- Pro: zero infra cost at launch; privacy story is trivially true
  ("your corpus never leaves your machine"); demo works offline.
- Pro: the browser demo and the real app share one data shape.
- Con: no multi-device until sync ships; some churn will be "I got a
  new laptop".
- Con: Studio tier (shared workspaces) blocked on sync, acceptable,
  it's waitlisted anyway.
- We revisit when 100 weekly-active workspaces sustain for a month.`;

const DECISION_MCP_NAMING = `# Decision: MCP tool naming convention

## Context
First draft of the MCP server exposed tools named cairn_create_asset,
cairn_search, cairn_get. Prefixing everything with "cairn_" fights how
agents read tool lists: the prefix is noise, the verb is the signal.
Anthropic's own servers use bare verb_noun names scoped by the server.

## Decision
Bare verb_noun, no product prefix: write_asset, get_asset, search_assets,
list_assets, list_versions, new_version, set_status, update_metadata,
diff_versions, find_similar. Plural nouns for list/search, singular for
single-record ops. Server id provides the namespace.

## Consequences
- Tool descriptions carry the product context instead of the names.
- Risk of collision with other servers' generic names, acceptable;
  hosts scope by server id.
- Rename shipped in 0.4.0 with aliases kept for one minor version.`;

const RETRIEVAL_EVAL_PROMPT = `You are evaluating a retrieval result from Cairn, a system of record for
AI-generated work. Given a QUERY and a RETURNED_ASSET, score how well the
asset answers the query.

Score 0-3:
- 3: the asset directly answers the query; a human would stop looking.
- 2: relevant and useful, but the human would open one more result.
- 1: topically related, practically unhelpful (wrong version, wrong scope).
- 0: unrelated, or a superseded draft when an approved successor exists.

Rules:
- An archived asset returned for a current-state query is at most 1.
- If the asset's status is "draft" and the query implies canonical info
  ("what is our pricing"), cap the score at 1.
- Judge only the content provided. Do not reward confident tone.

Return strict JSON: {"score": <0-3>, "reason": "<one sentence>"}

QUERY: {{query}}
RETURNED_ASSET (status={{status}}, updated={{updated}}):
{{content}}`;

const SUMMARISE_PROMPT = `System prompt: summarise-on-save (runs when an agent writes an asset)

You write the one-line summary stored alongside a Cairn asset. You will
receive the asset's title, type and full content.

Requirements:
- One sentence, max 140 characters, sentence case, no trailing full stop.
- Say what the asset IS and what it covers, not what it "aims to" do.
- For code: name the module's job and its key export.
- For decisions: state the decision itself, not the topic.
  Bad: "Decision about billing provider". Good: "Chose Polar over Stripe
  for launch billing".
- For datasets: rows × what they describe, plus the date range if present.
- Never start with "This asset", "A document", or the title itself.
- British spelling.

Return only the summary text, nothing else.`;

const CHURN_CSV = `cohort_month,signups,active_m1,active_m2,active_m3,churn_m1_pct,notes
2026-01,42,31,24,21,26.2,beta invite wave 1
2026-02,58,44,35,30,24.1,beta invite wave 2
2026-03,117,81,64,55,30.8,Product Hunt spike; tourist-heavy
2026-04,96,74,61,,22.9,onboarding email v2 shipped mid-month
2026-05,134,108,,,19.4,MCP quickstart moved to step 1
2026-06,171,142,,,17.0,review-queue empty-state rework

# Export: signups by first-workspace month, active = >=1 review action
# in month N. Generated from local telemetry opt-ins only (n=618).
# m1 churn improving 26% -> 17% since onboarding rework; m3 flat ~50%
# retention for pre-March cohorts. Watch: April m3 lands next week.`;

const METRICS_SNAPSHOT = `week_start,waitlist_total,demo_sessions,demo_completed_loop,mcp_installs,assets_written,assets_approved,retrievals
2026-05-25,412,188,61,37,203,88,341
2026-06-01,447,214,79,45,261,117,502
2026-06-08,489,197,74,52,240,131,588
2026-06-15,551,263,102,61,318,146,679
2026-06-22,608,241,97,68,295,158,745
2026-06-29,673,289,124,79,334,171,822

# demo_completed_loop = wrote + approved + retrieved in one session.
# retrievals/approved trending up (3.9 -> 4.8): approved assets get
# re-read, which is the whole thesis. Flag: demo completion stuck ~40%.`;

const OG_IMAGE_SVG =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'><rect width='1200' height='630' fill='%230f1115'/><g fill='%23d8d4cc'><rect x='96' y='388' width='120' height='36' rx='4'/><rect x='108' y='344' width='96' height='36' rx='4'/><rect x='120' y='300' width='72' height='36' rx='4'/><rect x='132' y='256' width='48' height='36' rx='4'/></g><text x='96' y='500' font-family='Georgia,serif' font-size='72' fill='%23f4f1ea'>Cairn</text><text x='96' y='552' font-family='Helvetica,Arial,sans-serif' font-size='30' fill='%238a877e'>The system of record for AI-generated work</text></svg>";

const LOGO_SVG =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='160' viewBox='0 0 480 160'><rect width='480' height='160' fill='%23f4f1ea'/><g fill='%231a1c20'><rect x='40' y='96' width='56' height='18' rx='3'/><rect x='46' y='74' width='44' height='18' rx='3'/><rect x='52' y='52' width='32' height='18' rx='3'/><rect x='58' y='30' width='20' height='18' rx='3'/></g><text x='128' y='104' font-family='Georgia,serif' font-size='56' fill='%231a1c20'>cairn</text></svg>";

const HERO_COPY = `# Homepage hero, draft 3

## Headline options (pick one)
1. Your agents write. You approve. Nothing gets lost.
2. The system of record for AI-generated work.
3. Stop losing your best AI work in chat scrollback.

Current pick: 1 as H1, 2 as the subhead kicker.

## Subhead
Cairn is where AI drafts become approved, versioned, findable assets -
and where your agents read them back, so every session starts from
canon instead of scratch.

## Primary CTA
"Try the demo" (no signup). Secondary: "Read how it works".

## Social proof strip (until we have logos)
"412 designer-founders on the waitlist", update weekly from a_j5k9l3m7n.

## Notes
- Headline 3 tested best in the Twitter poll but reads negative; keep
  for ads, not the homepage.
- Per voice guide: sentence case, no exclamation marks, no "seamless".`;

const WAITLIST_EMAIL = `Subject: You're on the Cairn waitlist (and the demo is open)

From: Richard <richard@tigerforest.co.uk>

Hi -

Thanks for joining the Cairn waitlist. Two things worth your time today:

1. The demo is live at cairn.app/demo. No signup. It seeds a realistic
   workspace so you can feel the loop: an agent writes drafts, you
   approve them, the agent reads the approved versions back.

2. If you use Claude Code or Claude Desktop, the MCP quickstart takes
   about four minutes: cairn.app/docs/mcp. Your own agent, your own
   corpus, on your own machine. Nothing leaves your laptop.

I'm building Cairn solo and I read every reply to this address. If your
AI work is currently scattered across chats, downloads and gists, tell
me the worst example, those stories shape the roadmap more than
anything else.

- Richard
Tiger Forest Ltd, registered in England. Unsubscribe: {{unsub_url}}`;

const SEARCH_PROTO = `// search/rank.ts, prototype, do not ship
// Scoring for demo search. BM25 is overkill for <1k assets; this is a
// hand-tuned linear blend so results feel intentional, not lexical.

export interface RankInput {
  titleHits: number; // query terms found in title
  contentHits: number; // query terms found in content
  status: "draft" | "review" | "approved" | "archived";
  ageDays: number;
  retrievals30d: number;
}

const STATUS_BOOST: Record<RankInput["status"], number> = {
  approved: 1.0,
  review: 0.72,
  draft: 0.55,
  archived: 0.2, // findable, never first
};

export function score(x: RankInput): number {
  const lexical = x.titleHits * 3 + x.contentHits;
  const freshness = Math.exp(-x.ageDays / 45);
  const demand = Math.log1p(x.retrievals30d) * 0.6;
  return (lexical + demand) * STATUS_BOOST[x.status] * (0.7 + 0.3 * freshness);
}

// TODO(richard): archived assets should surface when the query names
// them explicitly ("loci brief"), needs an exact-title escape hatch.
// TODO: field-scoped queries (collection:pricing) before launch? Probably not.`;

const ICP_NOTES = `# ICP notes: prosumer designer-founders

Synthesised from 14 waitlist interviews (May–June 2026) + Twitter DMs.

## Who they are
Solo or duo. Design-led founders, indie hackers, fractional consultants.
Revenue £0–£15k/mo. Ship with Claude Code / Cursor daily. Own 2–6 active
projects, each with its own positioning, pricing and voice.

## The moment of pain (verbatims)
- "I have nine pricing tables and genuinely don't know which is real."
- "Claude rewrote my bio slightly differently for the fourth time."
- "My best prompt lives in a chat I can't find. I've rewritten it twice."

## What they do today
Notion dump pages (8/14), pinned chats (6/14), a GDrive folder named
"AI" (4/14), nothing at all (3/14). Overlapping; all described as failing.

## What they'll pay for
Certainty, not storage. The word that landed in interviews was
"canonical". Willingness to pay clustered £10–15/mo. Two said they'd
pay more for provenance alone ("which chat did this come from").

## What scares them off
Another inbox. Anything that needs filing discipline. Enterprise DAM
vibes ("if I see the word taxonomy I'm out", P7).

## Implication
Review queue must feel like Tinder, not Jira. Approve in one keystroke.`;

const PRICING_FAQ = `# Pricing objections FAQ, draft

Q: Why £12 and not £9?
A: £9 shoppers churn on impulse; £12 buyers decide. It also matches
Expanvas Pro so the Tiger Forest price is one number. (See a_p8w2n4r7t.)

Q: What happens to my corpus if I cancel?
A: It's a SQLite file on your machine. Cancelling downgrades features;
it never takes your data. Export is one click and always free.

Q: Is the Free tier permanent or a trial?
A: Permanent. 100 assets and read-only MCP is genuinely useful; the
ceiling is version history (7 days) and write access.

Q: Why is write access paid but read free?
A: Reading approved context makes your agents better today, free, and
proves the loop. Writing is where the review workload, and value, is.

Q: Per-seat for Studio? Really?
A: Shared review queues create support load per human, not per corpus.
£29/seat funds that honestly. Solo (£12) has no seats to count.

Q: Annual discount?
A: £120/yr (two months free). No lifetime deals, a system of record
that might not exist in five years is a contradiction.`;

const IMPORT_SCRIPT = `// scripts/import-notion.ts
// Drain a Notion export zip into Cairn: one asset per markdown file.
// Usage: cairn-import ./Export-abc123.zip --collection research --status draft

import { readFileSync } from "node:fs";

export interface ImportedAsset {
  title: string;
  content: string;
  collection: string;
  status: "draft";
  tags: string[];
  provenanceNote: string;
}

const JUNK_PATTERNS = [/^Untitled/, /^Meeting notes 20/, /^Copy of /];

export function shouldImport(filename: string, body: string): boolean {
  if (!filename.endsWith(".md")) return false;
  if (JUNK_PATTERNS.some((p) => p.test(filename))) return false;
  const meaningful = body.replace(/\\s+/g, " ").trim();
  return meaningful.length >= 120; // skip stub pages
}

export function toAsset(filename: string, body: string, collection: string): ImportedAsset {
  const title = filename.replace(/\\.md$/, "").replace(/ [0-9a-f]{32}$/, "");
  return {
    title,
    content: body.trim(),
    collection,
    status: "draft", // everything imported lands in the review queue
    tags: ["imported", "notion"],
    provenanceNote: "Imported from Notion export; original file " + filename,
  };
}

export function readManifest(path: string): string[] {
  return readFileSync(path, "utf8").split("\\n").filter(Boolean);
}

// Deliberately no auto-approve flag. The whole point is that imported
// sludge goes through the same review gate as agent output.`;

const DECISION_POLAR = `# Decision: Polar over Stripe for launch billing

## Context
Billing options for Solo (£12/mo): Stripe direct (max control, we become
the merchant of record, VAT MOSS across the EU is ours to handle), or a
merchant-of-record layer, Polar or Paddle. One founder, no finance ops.
Expanvas already committed to Polar, so there's an account and mental
model in place.

## Decision
Polar as merchant of record for launch. Stripe direct is reconsidered
only if fees exceed £250/mo or we need usage-based billing.

## Consequences
- Pro: VAT, invoices and tax thresholds are Polar's problem, not mine.
- Pro: one billing stack across Tiger Forest products (Expanvas parity).
- Pro: checkout ships in a day; launch date holds.
- Con: ~4% + fees vs Stripe's ~1.5% + 20p, real money if MRR grows.
- Con: payout lag is longer; cashflow planning needed at scale.
- Revisit trigger written into the ops doc, not memory.`;

const TWEET_THREAD = `# Launch thread, draft 2 (do not post yet)

1/ I generate more work with AI in a week than I made by hand in a
month. And I kept losing the good stuff. So I built a system of record
for AI-generated work. It's called Cairn.

2/ The problem isn't generation, it's canon. Nine pricing tables, four
bios, three "final" positioning docs. Which one is real? Your agent
doesn't know either, so it writes a tenth.

3/ Cairn's loop: your agent writes drafts in over MCP (with provenance -
model, chat, the exact prompt). You approve or reject in a queue.
Approved assets become what your agents retrieve next session.

4/ It's local-first. SQLite on your machine. Your corpus never leaves
your laptop. Demo runs entirely in the browser, no signup.

5/ Free tier: 100 assets, agents can read your approved canon. £12/mo
if you want agents writing in with full history.

6/ Demo: cairn.app/demo, I'm @richardthedsgnr, building this solo,
replies open. Tell me the worst place you've lost AI work.

## Notes
- Hold until OG image (a_o3g7k1l5p) is approved.
- Tweet 5 needs re-check against final pricing table before posting.`;

const LOCI_BRIEF = `# Loci positioning brief (v0), SUPERSEDED

> Archived 26 June: product renamed Cairn after trademark search flagged
> two live "Loci" marks in software. See naming shortlist (a_x2z6c4v8b).

## One-liner (old)
Loci is a memory palace for your AI outputs.

## Pitch (old)
Every AI session scatters value across chats. Loci catches it, files it,
and serves it back to your tools. Think "photographic memory for your
AI workspace".

## Why it didn't hold
- "Memory palace" tested clever-but-cold; nobody self-describes the
  problem as memory. They say "I can't find the real version".
- Filing as automatic magic undersold the human approval step, which
  interviews showed is where trust comes from.
- Loci is unpronounceable on first read (low-key, low-sigh, lot-chee?).

Kept for the record: the retrieval framing in section 3 survived into
the Cairn brief nearly verbatim.`;

const NAMING_SHORTLIST = `# Naming shortlist, resolved: Cairn

Criteria: pronounceable on first read, evokes record/stacking/trail,
.app or .com attainable under £2k, no live software trademarks, works
as a verb-ish noun ("add it to the cairn").

| Name | Feel | Domain | Risk | Verdict |
| --- | --- | --- | --- | --- |
| Loci | Memory palace, clever | loci.app taken | 2 live marks | Rejected |
| Cairn | Waymarker, stacked stones | cairn.app quoted £1.4k | Clear | CHOSEN |
| Ledger | System of record, literal | ledger.com is a wallet | Crypto clash | Rejected |
| Bedrock | Solid, canonical | bedrock.app parked | AWS Bedrock | Rejected |
| Quarry | Where good stone comes from | available | Mining vibes | Runner-up |
| Strata | Layers, versions | strata.app SaaS exists | Live mark | Rejected |

Decision made 26 June with the trademark search PDF filed in Drive.
Cairn: stones stacked by many hands to mark the true path. On the nose,
and that's fine.`;

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

function buildAssets(now: number): DemoAsset[] {
  const assets: DemoAsset[] = [];

  /* --- Multi-version asset 1: Pricing table (3 versions) --- */
  {
    const id = "a_p8w2n4r7t";
    const c1 = now - 24 * DAY;
    const c2 = now - 19 * DAY;
    const c3 = now - 13 * DAY;
    const p1 = prov({
      model: "claude-fable-5",
      tool: "claude-code",
      source_chat: "claude-code session 41ab9f2e",
      source_chat_kind: "claude-code",
      source_prompt: "Draft a first pricing table for Cairn: three tiers, prosumer pricing in GBP, note the open questions.",
    });
    const p2 = prov({
      model: "claude-fable-5",
      tool: "claude-code",
      source_chat: "claude-code session 41ab9f2e",
      source_chat_kind: "claude-code",
      source_prompt: "Revise pricing: rename Starter, move MCP read into free, and bring Pro in line with Expanvas at £12.",
    });
    const p3 = prov({
      model: "claude-opus-4-8",
      tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/9c2e41d7-88b0-4f3a-a1c5-2d7e90b4f612",
      source_chat_kind: "claude-ai",
      source_prompt: "Final pass on the pricing table: rename tiers after the buyer, add annual, decide the Free limiter, lock decisions.",
    });
    const versions: Version[] = [
      { id: "v_p8w2n4r7t_1", asset_id: id, version_no: 1, content: PRICING_V1, size_bytes: PRICING_V1.length, author: "agent:claude", note: "First cut: Starter/Pro/Team at £0/£9/£19", created: c1, provenance: p1 },
      { id: "v_p8w2n4r7t_2", asset_id: id, version_no: 2, content: PRICING_V2, size_bytes: PRICING_V2.length, author: "agent:claude", note: "£9→£12; Starter renamed Free; MCP read-only moved into Free", created: c2, provenance: p2 },
      { id: "v_p8w2n4r7t_3", asset_id: id, version_no: 3, content: PRICING_V3, size_bytes: PRICING_V3.length, author: "agent:claude", note: "Tiers renamed Solo/Studio; annual added; decisions locked", created: c3, provenance: p3 },
    ];
    assets.push({
      id, type: "document", status: "approved",
      title: "Pricing table v3",
      summary: "Locked launch pricing: Free, Solo £12/mo (£120/yr), Studio £29/seat waitlisted",
      collection: "pricing", owner: "agent:claude", version_no: 3,
      content: PRICING_V3, tags: ["pricing", "launch", "locked"],
      provenance: p3, created: c1, updated: c3, versions,
    });
  }

  /* --- Multi-version asset 2: Onboarding email sequence (2 versions) --- */
  {
    const id = "a_m5j1q9x3z";
    const c1 = now - 15 * DAY;
    const c2 = now - 9 * DAY;
    const p1 = prov({
      model: "claude-sonnet-5",
      tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/7f3d2b91-4e6a-42c8-b5d0-1a9f8c3e7d24",
      source_chat_kind: "claude-ai",
      source_prompt: "Write a 5-email onboarding sequence for Cairn (day 0/1/3/5/7) driving toward connecting the MCP server and using the review queue.",
    });
    const p2 = prov({
      model: "claude-fable-5",
      tool: "cowork",
      source_chat: "cowork session 8d21c4a7",
      source_chat_kind: "cowork",
      source_prompt: "Rewrite the onboarding subject lines to be benefit-led per the voice guide, and replace the Maya case study email with objection handling.",
      derived_from: ["a_b9n5m1v7c"],
    });
    const versions: Version[] = [
      { id: "v_m5j1q9x3z_1", asset_id: id, version_no: 1, content: EMAILS_V1, size_bytes: EMAILS_V1.length, author: "agent:claude", note: "First full sequence, day 0-7", created: c1, provenance: p1 },
      { id: "v_m5j1q9x3z_2", asset_id: id, version_no: 2, content: EMAILS_V2, size_bytes: EMAILS_V2.length, author: "agent:claude", note: "Subject lines rewritten benefit-led; email 4 case study replaced with objection handling", created: c2, provenance: p2 },
    ];
    assets.push({
      id, type: "document", status: "approved",
      title: "Onboarding email sequence",
      summary: "Five-email day 0-7 sequence driving MCP connection and first review-queue session",
      collection: "lifecycle", owner: "agent:claude", version_no: 2,
      content: EMAILS_V2, tags: ["email", "onboarding", "lifecycle"],
      provenance: p2, created: c1, updated: c2, versions,
    });
  }

  /* --- Multi-version asset 3: API error-handling module (3 versions) --- */
  {
    const id = "a_c7v3b8n2k";
    const c1 = now - 20 * DAY;
    const c2 = now - 14 * DAY;
    const c3 = now - 8 * DAY;
    const p1 = prov({
      model: "claude-fable-5",
      tool: "claude-code",
      source_chat: "claude-code session c930d1fb",
      source_chat_kind: "claude-code",
      source_prompt: "Extract the error handling from the prototype fetch calls into api/errors.ts with a classify() and a request() wrapper.",
    });
    const p2 = prov({
      model: "claude-fable-5",
      tool: "claude-code",
      source_chat: "claude-code session c930d1fb",
      source_chat_kind: "claude-code",
      source_prompt: "Refactor api/errors.ts from callbacks to async/await and throw a typed ApiFailure instead of passing errors around.",
    });
    const p3 = prov({
      model: "claude-fable-5",
      tool: "claude-code",
      source_chat: "claude-code session f47e82ac",
      source_chat_kind: "claude-code",
      source_prompt: "Add retry with exponential backoff and deterministic jitter to request(); only retry retryable errors; keep the public signature compatible.",
    });
    const versions: Version[] = [
      { id: "v_c7v3b8n2k_1", asset_id: id, version_no: 1, content: ERRMOD_V1, size_bytes: ERRMOD_V1.length, author: "agent:claude", note: "Extracted from prototype; callback-style request()", created: c1, provenance: p1 },
      { id: "v_c7v3b8n2k_2", asset_id: id, version_no: 2, content: ERRMOD_V2, size_bytes: ERRMOD_V2.length, author: "agent:claude", note: "Refactor: callbacks → async/await, typed ApiFailure", created: c2, provenance: p2 },
      { id: "v_c7v3b8n2k_3", asset_id: id, version_no: 3, content: ERRMOD_V3, size_bytes: ERRMOD_V3.length, author: "agent:claude", note: "Added retry with exponential backoff + deterministic jitter", created: c3, provenance: p3 },
    ];
    assets.push({
      id, type: "code", status: "approved",
      title: "API error-handling module",
      summary: "Typed error classification and request() wrapper with backoff retry for the Cairn API client",
      collection: "engineering", owner: "agent:claude", version_no: 3,
      content: ERRMOD_V3, tags: ["typescript", "api", "errors", "retry"],
      provenance: p3, created: c1, updated: c3, versions,
    });
  }

  /* --- Single-version assets --- */

  assets.push(mk(now, {
    id: "a_k3x9v2m1q", type: "document", status: "approved",
    title: "Cairn positioning brief",
    summary: "Core positioning: system of record for AI-generated work, approval as the trust wedge",
    collection: "positioning", owner: "agent:claude",
    tags: ["positioning", "messaging", "canonical"],
    content: POSITIONING_BRIEF,
    provenance: prov({
      model: "claude-opus-4-8", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/2b8f61c4-0a3d-49e7-9f52-c81d34a7b906",
      source_chat_kind: "claude-ai",
      source_prompt: "Rewrite the Loci positioning brief for the Cairn rename: lead with 'system of record', keep the retrieval framing, add objection handling.",
      derived_from: ["a_v7c1x5z9b"],
    }),
    createdAgo: 26 * DAY, updatedAgo: 24 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_t4r8y2u6i", type: "document", status: "approved",
    title: "Competitor teardown: AI-native DAM space",
    summary: "Landscape scan: DAMs, Notion, chat-search tools and second brains; whitespace is the full write-approve-retrieve loop",
    collection: "research", owner: "agent:claude",
    tags: ["research", "competitors", "market"],
    content: TEARDOWN,
    provenance: prov({
      model: "claude-opus-4-8", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/6e19d3a8-72cf-4b04-8ed1-f59a20c7b3e8",
      source_chat_kind: "claude-ai",
      source_prompt: "Do a competitor teardown of everything a prosumer might use instead of Cairn, DAMs, Notion, chat search, second brains, git, and name the whitespace.",
    }),
    createdAgo: 18 * DAY, updatedAgo: 16 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_b9n5m1v7c", type: "document", status: "approved",
    title: "Brand voice guide",
    summary: "Voice rules: plain over clever, British spelling, banned-word list, tone by surface",
    collection: "brand", owner: "agent:claude",
    tags: ["brand", "voice", "copy", "canonical"],
    content: VOICE_GUIDE,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/d4a7f209-3b61-48ce-a90d-7e2c85b1f430",
      source_chat_kind: "claude-ai",
      source_prompt: "Turn my scattered copy notes into a brand voice guide for Cairn: principles, banned words, punctuation rules, tone per surface.",
    }),
    createdAgo: 25 * DAY, updatedAgo: 23 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_d2f6g8h4j", type: "decision", status: "approved",
    title: "Launch decision: local-first before cloud",
    summary: "Chose local-first launch (SQLite + local MCP, no accounts); cloud sync gated on retention proof",
    collection: "engineering", owner: "human:richard",
    tags: ["decision", "architecture", "launch"],
    content: DECISION_LOCAL_FIRST,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session 1e77b0d3",
      source_chat_kind: "claude-code",
      source_prompt: "Write up today's local-first vs hosted discussion as a decision record: context, decision, consequences, revisit trigger.",
    }),
    createdAgo: 23 * DAY, updatedAgo: 22 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_q8z4x2c6v", type: "decision", status: "approved",
    title: "Decision: MCP tool naming convention",
    summary: "Chose bare verb_noun MCP tool names (write_asset, search_assets) over cairn_-prefixed names",
    collection: "engineering", owner: "human:richard",
    tags: ["decision", "mcp", "api"],
    content: DECISION_MCP_NAMING,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session 5ba3e91c",
      source_chat_kind: "claude-code",
      source_prompt: "Record the MCP tool renaming as a decision record with the singular/plural convention and the alias deprecation plan.",
    }),
    createdAgo: 21 * DAY, updatedAgo: 21 * DAY - 3 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_e1w5r9t3y", type: "prompt", status: "approved",
    title: "Retrieval eval prompt",
    summary: "LLM-judge prompt scoring retrieval results 0-3 with status-aware caps and strict JSON output",
    collection: "engineering", owner: "agent:claude",
    tags: ["prompt", "eval", "retrieval"],
    content: RETRIEVAL_EVAL_PROMPT,
    provenance: prov({
      model: "gpt-5.2", tool: "cowork",
      source_chat: "cowork session 3f9a72e1",
      source_chat_kind: "cowork",
      source_prompt: "Write an LLM-judge prompt for scoring Cairn retrieval quality 0-3, penalising superseded drafts and archived assets, strict JSON out.",
    }),
    createdAgo: 16 * DAY, updatedAgo: 15 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_y6u2i8o4p", type: "prompt", status: "approved",
    title: "Summarise-on-save prompt",
    summary: "System prompt generating the one-line asset summary at write time, with per-type rules",
    collection: "engineering", owner: "agent:claude",
    tags: ["prompt", "summaries", "pipeline"],
    content: SUMMARISE_PROMPT,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session 9d04c6b8",
      source_chat_kind: "claude-code",
      source_prompt: "Write the system prompt that produces the one-line summary when an asset is saved. Max 140 chars, per-type rules, British spelling.",
    }),
    createdAgo: 12 * DAY, updatedAgo: 11 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_s6d2f8g4h", type: "dataset", status: "approved",
    title: "Churn cohort export",
    summary: "Six monthly cohorts (Jan-Jun 2026) with m1-m3 activity; m1 churn improved 26% to 17% after onboarding rework",
    collection: "research", owner: "agent:claude",
    tags: ["dataset", "churn", "cohorts", "metrics"],
    content: CHURN_CSV,
    provenance: prov({
      model: "gpt-5.2", tool: "cowork",
      source_chat: "cowork session b6e04d92",
      source_chat_kind: "cowork",
      source_prompt: "Export beta cohorts by first-workspace month with m1-m3 active rates and annotate each cohort with what changed that month.",
    }),
    createdAgo: 9 * DAY, updatedAgo: 9 * DAY - 4 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_j5k9l3m7n", type: "dataset", status: "review",
    title: "Weekly metrics snapshot",
    summary: "Six weeks of waitlist, demo funnel and MCP activity; retrievals per approved asset trending 3.9 to 4.8",
    collection: "research", owner: "agent:claude",
    tags: ["dataset", "metrics", "weekly"],
    content: METRICS_SNAPSHOT,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-code",
      source_chat: "claude-code session 72c8f5d0",
      source_chat_kind: "claude-code",
      source_prompt: "Pull the weekly funnel numbers into a CSV snapshot and flag anything that moved more than 15% week over week.",
    }),
    createdAgo: 7 * DAY, updatedAgo: 3 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_o3g7k1l5p", type: "image", status: "review",
    title: "OG image concept",
    summary: "1200x630 social card: stacked-stones mark, serif wordmark, one-line tagline on dark ground",
    collection: "brand", owner: "agent:claude",
    tags: ["image", "og", "social", "launch"],
    content: OG_IMAGE_SVG,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/a91c5e37-6d20-4b8f-b3e4-08d7f2c96a51",
      source_chat_kind: "claude-ai",
      source_prompt: "Sketch an OG image as inline SVG: dark ground, the stacked-stones cairn mark, wordmark in Georgia, tagline under it.",
    }),
    createdAgo: 6 * DAY, updatedAgo: 2 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_l1k5j9h3g", type: "image", status: "draft",
    title: "Logo lockup exploration",
    summary: "Horizontal lockup: four stacked stones beside lowercase serif wordmark on bone ground",
    collection: "brand", owner: "agent:claude",
    tags: ["image", "logo", "identity"],
    content: LOGO_SVG,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/a91c5e37-6d20-4b8f-b3e4-08d7f2c96a51",
      source_chat_kind: "claude-ai",
      source_prompt: "Try a horizontal logo lockup as SVG: the stone stack at small size next to a lowercase 'cairn' wordmark.",
    }),
    createdAgo: 3 * DAY, updatedAgo: 1 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_u5i9o3p7l", type: "document", status: "review",
    title: "Homepage hero copy",
    summary: "Three headline options with subhead and CTA copy; pick one pending review against the voice guide",
    collection: "positioning", owner: "agent:claude",
    tags: ["copy", "homepage", "launch"],
    content: HERO_COPY,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/f82b04d6-9a17-4ce3-8b60-5d3e21c9f748",
      source_chat_kind: "claude-ai",
      source_prompt: "Draft homepage hero options from the approved positioning brief. Three headlines, one subhead, CTAs. Follow the voice guide.",
      derived_from: ["a_k3x9v2m1q", "a_b9n5m1v7c"],
    }),
    createdAgo: 5 * DAY, updatedAgo: 2 * DAY + 6 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_h2j6k4l8m", type: "document", status: "approved",
    title: "Waitlist welcome email",
    summary: "Single welcome email pointing to the no-signup demo and the four-minute MCP quickstart",
    collection: "lifecycle", owner: "agent:claude",
    tags: ["email", "waitlist", "lifecycle"],
    content: WAITLIST_EMAIL,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/7f3d2b91-4e6a-42c8-b5d0-1a9f8c3e7d24",
      source_chat_kind: "claude-ai",
      source_prompt: "Write the waitlist welcome email from Richard: point to the demo and MCP quickstart, ask for the reader's worst lost-work story.",
    }),
    createdAgo: 14 * DAY, updatedAgo: 12 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_n7b3v9c1x", type: "code", status: "draft",
    title: "Search ranking prototype",
    summary: "Hand-tuned linear ranking blend (lexical, status boost, freshness, demand) for demo search",
    collection: "engineering", owner: "agent:claude",
    tags: ["typescript", "search", "prototype"],
    content: SEARCH_PROTO,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session f47e82ac",
      source_chat_kind: "claude-code",
      source_prompt: "Prototype a ranking function for demo search: title/content hits, status boost, freshness decay, retrieval demand. Keep it hand-tunable.",
    }),
    createdAgo: 2 * DAY, updatedAgo: 1 * DAY - 3 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_z4x8c2v6b", type: "document", status: "approved",
    title: "ICP notes: prosumer designer-founders",
    summary: "Synthesis of 14 waitlist interviews: the buyer wants canonical certainty, pays £10-15/mo, fears filing discipline",
    collection: "research", owner: "human:richard",
    tags: ["research", "icp", "interviews"],
    content: ICP_NOTES,
    provenance: prov({
      model: "claude-opus-4-8", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/33e0b8c5-1f74-4a29-9d06-8b52e7d4a190",
      source_chat_kind: "claude-ai",
      source_prompt: "Synthesise my 14 interview note files into ICP notes: who they are, verbatim pain, current workarounds, willingness to pay, red flags.",
    }),
    createdAgo: 19 * DAY, updatedAgo: 18 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_f8d4s2a6q", type: "document", status: "draft",
    title: "Pricing objections FAQ",
    summary: "Draft answers to the six pricing objections, aligned to the locked v3 pricing table",
    collection: "pricing", owner: "agent:claude",
    tags: ["pricing", "faq", "copy"],
    content: PRICING_FAQ,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session 60df31ba",
      source_chat_kind: "claude-code",
      source_prompt: "Draft a pricing FAQ answering the objections from the ICP interviews, consistent with the approved pricing table v3.",
      derived_from: ["a_p8w2n4r7t", "a_z4x8c2v6b"],
    }),
    createdAgo: 4 * DAY, updatedAgo: 3 * DAY - 5 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_w3e7r1t5y", type: "code", status: "approved",
    title: "Import script: Notion export to Cairn",
    summary: "Drains a Notion export zip into draft assets, junk-filtered, everything routed through the review gate",
    collection: "engineering", owner: "agent:claude",
    tags: ["typescript", "import", "notion", "migration"],
    content: IMPORT_SCRIPT,
    provenance: prov({
      model: "claude-fable-5", tool: "claude-code",
      source_chat: "claude-code session 2ac6e83d",
      source_chat_kind: "claude-code",
      source_prompt: "Write the Notion import script: one asset per markdown file, junk filters, everything imported lands as draft in the review queue.",
    }),
    createdAgo: 10 * DAY, updatedAgo: 9 * DAY - 2 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_r9t5y1u7i", type: "decision", status: "approved",
    title: "Decision: Polar over Stripe for launch billing",
    summary: "Chose Polar as merchant of record for launch; Stripe reconsidered above £250/mo in fees",
    collection: "pricing", owner: "human:richard",
    tags: ["decision", "billing", "polar"],
    content: DECISION_POLAR,
    provenance: prov({
      model: "claude-opus-4-8", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/5d90c7f2-eb43-481a-9c15-6a08d3b7e924",
      source_chat_kind: "claude-ai",
      source_prompt: "Write up the billing provider choice as a decision record. We're going Polar for MoR parity with Expanvas; capture the fee trade-off honestly.",
    }),
    createdAgo: 11 * DAY, updatedAgo: 11 * DAY - 2 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_g4h8j2k6l", type: "document", status: "draft",
    title: "Launch tweet thread",
    summary: "Six-tweet launch thread, held until the OG image is approved and pricing is re-checked",
    collection: "positioning", owner: "agent:claude",
    tags: ["social", "launch", "copy"],
    content: TWEET_THREAD,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/f82b04d6-9a17-4ce3-8b60-5d3e21c9f748",
      source_chat_kind: "claude-ai",
      source_prompt: "Draft the launch thread from the positioning brief: problem, loop, local-first, pricing, CTA. Six tweets, my voice, no hype words.",
      derived_from: ["a_k3x9v2m1q"],
    }),
    createdAgo: 1 * DAY, updatedAgo: 2 * HOUR,
  }));

  assets.push(mk(now, {
    id: "a_v7c1x5z9b", type: "document", status: "archived",
    title: "Loci positioning brief (v0)",
    summary: "Superseded pre-rename positioning ('memory palace' framing); kept for the record",
    collection: "positioning", owner: "agent:claude",
    tags: ["positioning", "superseded", "loci"],
    content: LOCI_BRIEF,
    provenance: prov({
      model: "claude-sonnet-5", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/1a6e93d0-27b5-4f18-8c4d-e05b72a9f316",
      source_chat_kind: "claude-ai",
      source_prompt: "Draft a positioning brief for Loci around the memory-palace metaphor: catch AI outputs, file them, serve them back.",
    }),
    createdAgo: 29 * DAY, updatedAgo: 26 * DAY,
  }));

  assets.push(mk(now, {
    id: "a_x2z6c4v8b", type: "document", status: "archived",
    title: "Naming shortlist",
    summary: "Six-name shortlist with trademark and domain notes; resolved to Cairn, Quarry runner-up",
    collection: "brand", owner: "human:richard",
    tags: ["naming", "brand", "resolved"],
    content: NAMING_SHORTLIST,
    provenance: prov({
      model: "claude-opus-4-8", tool: "claude-desktop",
      source_chat: "https://claude.ai/chat/be5209a4-71cd-4e83-b6f0-3c98d1a45e72",
      source_chat_kind: "claude-ai",
      source_prompt: "Score my six name candidates against the naming criteria and lay out the shortlist as a table with a verdict per name.",
    }),
    createdAgo: 28 * DAY - 12 * HOUR, updatedAgo: 26 * DAY + 6 * HOUR,
  }));

  return assets;
}

/* ------------------------------------------------------------------ */
/* Events + audit                                                      */
/* ------------------------------------------------------------------ */

interface StatusChange {
  assetId: string;
  from: Status;
  to: Status;
  ts: number;
  actor: string;
}

function buildStatusChanges(now: number): StatusChange[] {
  const r = "human:richard";
  return [
    { assetId: "a_v7c1x5z9b", from: "approved", to: "archived", ts: now - 26 * DAY, actor: r },
    { assetId: "a_x2z6c4v8b", from: "approved", to: "archived", ts: now - 26 * DAY + 5 * HOUR, actor: r },
    { assetId: "a_k3x9v2m1q", from: "draft", to: "review", ts: now - 25 * DAY, actor: "agent:claude" },
    { assetId: "a_k3x9v2m1q", from: "review", to: "approved", ts: now - 24 * DAY, actor: r },
    { assetId: "a_b9n5m1v7c", from: "review", to: "approved", ts: now - 23 * DAY, actor: r },
    { assetId: "a_d2f6g8h4j", from: "draft", to: "approved", ts: now - 22 * DAY, actor: r },
    { assetId: "a_p8w2n4r7t", from: "draft", to: "review", ts: now - 13 * DAY + 2 * HOUR, actor: "agent:claude" },
    { assetId: "a_p8w2n4r7t", from: "review", to: "approved", ts: now - 12 * DAY - 6 * HOUR, actor: r },
    { assetId: "a_c7v3b8n2k", from: "draft", to: "review", ts: now - 8 * DAY + 3 * HOUR, actor: "agent:claude" },
    { assetId: "a_c7v3b8n2k", from: "review", to: "approved", ts: now - 7 * DAY - 4 * HOUR, actor: r },
    { assetId: "a_m5j1q9x3z", from: "review", to: "approved", ts: now - 8 * DAY - 8 * HOUR, actor: r },
    { assetId: "a_h2j6k4l8m", from: "review", to: "approved", ts: now - 12 * DAY, actor: r },
    { assetId: "a_j5k9l3m7n", from: "draft", to: "review", ts: now - 3 * DAY, actor: "agent:claude" },
    { assetId: "a_o3g7k1l5p", from: "draft", to: "review", ts: now - 2 * DAY, actor: "agent:claude" },
    { assetId: "a_u5i9o3p7l", from: "draft", to: "review", ts: now - 2 * DAY + 6 * HOUR, actor: "agent:claude" },
  ];
}

interface DupWarn {
  ts: number;
  attempted_title: string;
  similar_to: string;
}

function buildDupWarns(now: number): DupWarn[] {
  return [
    { ts: now - 22 * DAY + 7 * HOUR, attempted_title: "Cairn positioning doc", similar_to: "a_k3x9v2m1q" },
    { ts: now - 17 * DAY + 3 * HOUR, attempted_title: "Pricing tiers draft", similar_to: "a_p8w2n4r7t" },
    { ts: now - 13 * DAY + 9 * HOUR, attempted_title: "Voice and tone guide", similar_to: "a_b9n5m1v7c" },
    { ts: now - 11 * DAY + 4 * HOUR, attempted_title: "Welcome email for waitlist", similar_to: "a_h2j6k4l8m" },
    { ts: now - 8 * DAY + 6 * HOUR, attempted_title: "Error handling utilities", similar_to: "a_c7v3b8n2k" },
    { ts: now - 5 * DAY + 2 * HOUR, attempted_title: "Competitor analysis: DAM tools", similar_to: "a_t4r8y2u6i" },
    { ts: now - 2 * DAY + 11 * HOUR, attempted_title: "Homepage headline options", similar_to: "a_u5i9o3p7l" },
    { ts: now - 1 * DAY + 5 * HOUR, attempted_title: "Pricing table v4", similar_to: "a_p8w2n4r7t" },
  ];
}

const SEARCH_QUERIES: { query: string; hits: number }[] = [
  { query: "pricing", hits: 3 },
  { query: "positioning brief", hits: 2 },
  { query: "onboarding email", hits: 2 },
  { query: "error handling retry", hits: 1 },
  { query: "brand voice banned words", hits: 1 },
  { query: "churn cohort", hits: 2 },
  { query: "stripe webhook config", hits: 0 },
  { query: "figma tokens export", hits: 0 },
];

export function buildSeed(now: number): DemoState {
  const assets = buildAssets(now);
  const byId = new Map(assets.map((a) => [a.id, a]));
  const statusChanges = buildStatusChanges(now);
  const dupWarns = buildDupWarns(now);
  const rand = mulberry32(0xca19_0001);

  /* ---- Events ---- */
  type Ev = Omit<EventRow, "id">;
  const evs: Ev[] = [];

  // asset.created, one per asset, at its created ts.
  for (const a of assets) {
    evs.push({
      ts: a.created,
      kind: "asset.created",
      actor: a.owner,
      asset_id: a.id,
      payload: JSON.stringify({ title: a.title, type: a.type, collection: a.collection }),
    });
  }

  // version.added, one per extra version.
  for (const a of assets) {
    for (const v of a.versions.slice(1)) {
      evs.push({
        ts: v.created,
        kind: "version.added",
        actor: v.author,
        asset_id: a.id,
        payload: JSON.stringify({ version_no: v.version_no, note: v.note }),
      });
    }
  }

  // asset.retrieved, ~90, weighted toward approved assets.
  const pool: string[] = [];
  for (const a of assets) {
    if (a.status === "approved") pool.push(a.id, a.id, a.id, a.id);
    else if (a.status === "review") pool.push(a.id, a.id);
    else pool.push(a.id);
  }
  const RETRIEVE_TOOLS = ["get_asset", "get_asset", "get_asset", "list_versions", "search_assets"];
  for (let i = 0; i < 90; i++) {
    const id = pool[Math.floor(rand() * pool.length)]!;
    const a = byId.get(id)!;
    const span = now - 1 * HOUR - a.created;
    evs.push({
      ts: a.created + Math.floor(rand() * Math.max(span, HOUR)),
      kind: "asset.retrieved",
      actor: i % 9 === 4 ? "human:richard" : "agent:claude",
      asset_id: id,
      payload: JSON.stringify({ via: "mcp", tool: RETRIEVE_TOOLS[i % RETRIEVE_TOOLS.length] }),
    });
  }

  // search.performed, 50, 8 distinct queries (2 zero-hit), asset_id null.
  for (let i = 0; i < 50; i++) {
    const q = SEARCH_QUERIES[i < SEARCH_QUERIES.length ? i : Math.floor(rand() * SEARCH_QUERIES.length)]!;
    evs.push({
      ts: now - 2 * HOUR - Math.floor(rand() * (29 * DAY - 4 * HOUR)),
      kind: "search.performed",
      actor: i % 7 === 3 ? "human:richard" : "agent:claude",
      asset_id: null,
      payload: JSON.stringify({ query: q.query, hits: q.hits }),
    });
  }

  // duplicate.warned, 8.
  for (const d of dupWarns) {
    evs.push({
      ts: d.ts,
      kind: "duplicate.warned",
      actor: "agent:claude",
      asset_id: d.similar_to,
      payload: JSON.stringify({ attempted_title: d.attempted_title, similar_to: d.similar_to }),
    });
  }

  // status.changed, 15.
  for (const s of statusChanges) {
    evs.push({
      ts: s.ts,
      kind: "status.changed",
      actor: s.actor,
      asset_id: s.assetId,
      payload: JSON.stringify({ from: s.from, to: s.to }),
    });
  }

  evs.sort((x, y) => x.ts - y.ts);
  const events: EventRow[] = evs.map((e, i) => ({ id: i + 1, ...e }));

  /* ---- Audit ---- */
  type Au = Omit<AuditRow, "id">;
  const aus: Au[] = [];

  for (const a of assets) {
    aus.push({
      ts: a.created,
      actor: a.owner,
      action: "asset.created",
      asset_id: a.id,
      detail: 'Created "' + a.title + '" (' + a.type + ") in " + a.collection,
    });
  }
  for (const a of assets) {
    for (const v of a.versions.slice(1)) {
      aus.push({
        ts: v.created,
        actor: v.author,
        action: "version.added",
        asset_id: a.id,
        detail: "v" + v.version_no + ": " + v.note,
      });
    }
  }
  // A representative subset of status changes (8 of 15).
  for (const s of statusChanges.filter((_, i) => i % 2 === 0)) {
    aus.push({
      ts: s.ts,
      actor: s.actor,
      action: "status.changed",
      asset_id: s.assetId,
      detail: s.from + " → " + s.to,
    });
  }
  // Metadata edits.
  aus.push(
    {
      ts: now - 18 * DAY + 5 * HOUR,
      actor: "human:richard",
      action: "metadata.edited",
      asset_id: "a_k3x9v2m1q",
      detail: 'Tags: added "canonical"',
    },
    {
      ts: now - 9 * DAY + 6 * HOUR,
      actor: "agent:claude",
      action: "metadata.edited",
      asset_id: "a_s6d2f8g4h",
      detail: "Summary regenerated after cohort annotation update",
    },
    {
      ts: now - 2 * DAY + 8 * HOUR,
      actor: "human:richard",
      action: "metadata.edited",
      asset_id: "a_o3g7k1l5p",
      detail: 'Collection: moved "positioning" → "brand"',
    }
  );

  aus.sort((x, y) => x.ts - y.ts);
  const audit: AuditRow[] = aus.map((a, i) => ({ id: i + 1, ...a }));

  return {
    assets,
    audit,
    events,
    nextEventId: events.length + 1,
    nextAuditId: audit.length + 1,
    seededAt: now,
  };
}
