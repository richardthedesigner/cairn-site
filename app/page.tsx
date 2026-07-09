import type { Metadata } from "next";
import Link from "next/link";
import { CodeSnippet, Section, SectionLabel, Shot } from "@/components/marketing/bits";
import { LoopDiagram } from "@/components/marketing/LoopDiagram";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name}: the system of record for AI-generated work`,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { title: `${site.name}: your AI makes great work. Cairn keeps it.`, description: site.description },
};

const MCP_TOOLS = [
  "search_assets",
  "get_asset",
  "write_asset",
  "new_version",
  "diff_versions",
  "set_status",
  "find_similar",
  "list_collections",
  "set_session_context",
];

const PILLARS = [
  {
    label: "Search",
    title: "Everything findable",
    body: "Full-text and faceted search across every asset your AI has ever made, filtered by type, model, status, project, date. Not by scrolling last month's conversations.",
    micro: `search_assets("pricing") → the approved pricing table, not a chat dump`,
  },
  {
    label: "Versions",
    title: "One canonical current",
    body: "One document, an immutable version history, visual diffs. “Final” stops being a guess spread across five conversations.",
    micro: "v1 → v3 · +12 −7 lines · current: v3",
  },
  {
    label: "Provenance",
    title: "Every file answers for itself",
    body: "Which chat produced this. Which model, which prompt, derived from what. On every asset, automatically, with an append-only audit trail.",
    micro: "source: claude.ai/chat/7f3d… · claude-fable-5",
  },
  {
    label: "Native AI · MCP",
    title: "Built for the next session",
    body: "Agents read curated, approved context straight from Cairn and write their output straight back, in Claude, Claude Code, Cursor, anything that speaks MCP.",
    micro: "write_asset(…) → lands in your review queue, not your downloads",
  },
];

const ALSO = [
  { title: "Sharing", body: "A browsable library with stable links per asset and per version. Export the whole corpus as portable JSON." },
  { title: "Duplicate guard", body: "“This already exists”: Cairn versions instead of duplicating when an agent re-makes the same file." },
  { title: "Analytics", body: "Retrieval heatmaps, duplicate pressure, what your agents actually reuse." },
  { title: "Audit", body: "Append-only log of every action, human or agent. Governance inherited from legal-grade document management." },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "macOS, Linux, Windows",
    description: site.description,
    url: site.url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP", description: "Solo: free, local-first, forever" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function Home() {
  return (
    <main className="flex-1">
      <JsonLd />

      {/* hero */}
      <Section className="pt-20 pb-16 text-center md:pt-28">
        <p className="mono-label rise-in text-copper">The system of record for AI-generated work</p>
        <h1 className="display-hero rise-in mx-auto mt-5 max-w-4xl [animation-delay:80ms]">
          Your AI makes great work. Cairn keeps it.
        </h1>
        <p className="rise-in mx-auto mt-6 max-w-xl text-lg text-muted [animation-delay:160ms]">
          Everything your AI makes: findable, versioned, and ready for its next
          session. Not buried in chat scrollback.
        </p>
        <div className="rise-in mt-9 flex items-center justify-center gap-6 [animation-delay:240ms]">
          <Link href="/demo" className="pill-primary">
            Try the live demo
          </Link>
          <Link href="/docs" className="text-link text-sm">
            Run it locally
          </Link>
        </div>
        <div className="rise-in mt-16 [animation-delay:320ms]">
          <Shot src="/shots/home-hero.png" alt="The Cairn library: searchable, versioned assets with statuses and provenance" priority />
        </div>
      </Section>

      {/* the problem */}
      <Section className="py-20 md:py-28">
        <SectionLabel>The problem</SectionLabel>
        <h2 className="display-section mt-4 max-w-3xl">
          AI chat tools are brilliant at making documents and terrible at keeping them.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <p className="border-t border-hairline pt-5 text-muted">
            <strong className="font-medium text-body">Buried in scrollback.</strong>{" "}
            Finding last month&rsquo;s brief means scrolling a dead conversation, or
            asking the model to make it again, slightly differently.
          </p>
          <p className="border-t border-hairline pt-5 text-muted">
            <strong className="font-medium text-body">Five versions, none canonical.</strong>{" "}
            “Final” and “draft” look identical when they live in five different chats.
          </p>
          <p className="border-t border-hairline pt-5 text-muted">
            <strong className="font-medium text-body">Every session starts from zero.</strong>{" "}
            You re-paste context as noisy blobs, and the value of yesterday&rsquo;s work
            quietly evaporates.
          </p>
        </div>
      </Section>

      {/* pillars */}
      <Section className="pb-20 md:pb-28">
        <SectionLabel>What Cairn does</SectionLabel>
        <h2 className="display-section mt-4">Four things, done properly.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.label} className="rounded-card bg-stone p-7">
              <p className="mono-label text-muted">{p.label}</p>
              <h3 className="display-card mt-3">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
              <p className="mt-5 border-t border-hairline pt-4 font-mono text-xs text-copper">
                {p.micro}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 rounded-card border border-line p-7 sm:grid-cols-2 lg:grid-cols-4">
          {ALSO.map((a) => (
            <div key={a.title}>
              <h3 className="text-sm font-medium">{a.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* the loop */}
      <Section className="pb-20 md:pb-28">
        <div className="rounded-media bg-pale-green px-6 py-14 md:px-14">
          <SectionLabel>The loop</SectionLabel>
          <h2 className="display-section mt-4 max-w-2xl">
            Agents draft. You approve. The next session already knows.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Cairn sits between your agents and you: machine-made work lands as drafts,
            humans promote what&rsquo;s good, and every future session reads from the
            approved tier instead of starting over.
          </p>
          <div className="mt-10">
            <LoopDiagram />
          </div>
        </div>
      </Section>

      {/* MCP band */}
      <Section className="pb-20 md:pb-28">
        <div className="rounded-media bg-band px-6 py-14 text-band-ink md:px-14">
          <SectionLabel onDark>Native MCP</SectionLabel>
          <h2 className="display-section mt-4 max-w-2xl">
            Your agents already know how to use it.
          </h2>
          <p className="mt-4 max-w-xl opacity-75">
            One registration and every MCP client on your machine can search, read,
            and write your corpus, with provenance captured on the way in.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <CodeSnippet onDark>{`# register once
claude mcp add --scope user cairn -- node cairn/packages/mcp/dist/index.js

# then, in any session
> search_assets("onboarding email")
> get_asset("a_m5j1q9x3z")   # approved v2, not a stale paste`}</CodeSnippet>
            <div>
              <p className="mono-label opacity-60">The tool surface</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {MCP_TOOLS.map((t) => (
                  <li
                    key={t}
                    className="rounded-chip border border-white/20 px-3 py-1 font-mono text-xs"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm opacity-75">
                Works with Claude Desktop, Claude Code, Cursor, and anything else that speaks MCP.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* demo strip */}
      <Section className="pb-24 md:pb-32">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionLabel>No signup</SectionLabel>
            <h2 className="display-section mt-4">Use it right now.</h2>
            <p className="mt-4 text-muted">
              The full product experience, seeded with a real corpus, running in your
              browser. Search it, diff it, approve things, then watch an agent do the same.
            </p>
            <Link href="/demo" className="pill-primary mt-7">
              Open the sandbox
            </Link>
          </div>
          <Link href="/demo" aria-label="Open the live demo">
            <Shot src="/shots/demo-strip.png" alt="The Cairn demo: review queue with an agent-written draft awaiting approval" />
          </Link>
        </div>
      </Section>
    </main>
  );
}
