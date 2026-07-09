import type { Metadata } from "next";
import Link from "next/link";
import { CodeSnippet, Section, SectionLabel } from "@/components/marketing/bits";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Cairn's architecture in three sentences: local-first SQLite, one daemon, an MCP server for machines and a web app for humans. Tool contracts and quickstart included.",
  alternates: { canonical: "/how-it-works" },
};

const TOOLS: { name: string; sig: string; note: string }[] = [
  { name: "search_assets", sig: "(query, filters?) → Asset[]", note: "BM25 full-text over title, summary, content, tags. Defaults to the approved tier: the trusted, human-reviewed set." },
  { name: "get_asset", sig: "(id, version?) → Asset", note: "Full content plus provenance. Current version by default, any version on request." },
  { name: "write_asset", sig: "(title, type, content, provenance) → draft", note: "Capture with provenance. Always lands as a draft; a human promotes it. Near-duplicates are refused with a hint to version instead." },
  { name: "new_version", sig: "(id, content, note) → Asset", note: "The right way to improve existing work. Immutable history, one canonical current." },
  { name: "diff_versions", sig: "(id, from, to) → patch", note: "Unified diff between any two versions." },
  { name: "set_status", sig: "(id, status) → Asset", note: "draft → review → approved → archived. Every transition is audited." },
  { name: "find_similar", sig: "(text) → matches", note: "The duplicate guard, callable directly. Check before creating." },
  { name: "list_collections", sig: "() → Collection[]", note: "The shape of the corpus: names and counts." },
  { name: "set_session_context", sig: "(chat, model, tool)", note: "Call once per session so every subsequent write is traceable to its conversation." },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <Section className="pt-20 pb-14 md:pt-28">
        <SectionLabel>How it works</SectionLabel>
        <h1 className="display-hero mt-5 max-w-3xl">Local-first. One daemon. Two doors.</h1>
        <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
          <p>
            Cairn is a single local daemon over a SQLite database in your home
            directory; your corpus never has to leave your machine.
          </p>
          <p>
            Machines use the MCP server: any MCP client can search, read and write
            with provenance captured automatically.
          </p>
          <p>
            Humans use the web app on localhost: library, review queue, diffs,
            analytics, audit.
          </p>
        </div>
      </Section>

      <Section className="pb-20 md:pb-28">
        <SectionLabel>Quickstart</SectionLabel>
        <h2 className="display-section mt-4">Running in three commands.</h2>
        <div className="mt-8 max-w-2xl">
          <CodeSnippet>{`git clone ${site.productRepo}.git cairn && cd cairn
npm install && npm start        # web app on http://localhost:4800
claude mcp add --scope user cairn -- node $PWD/packages/mcp/dist/index.js`}</CodeSnippet>
          <p className="mt-4 text-sm text-muted">
            Full setup, including Claude Desktop registration and first capture, lives in{" "}
            <Link href="/docs" className="text-link">
              the docs
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section className="pb-20 md:pb-28">
        <SectionLabel>The contract</SectionLabel>
        <h2 className="display-section mt-4">Nine tools, no magic.</h2>
        <p className="mt-4 max-w-xl text-muted">
          The whole machine interface. Small enough to read, boring enough to trust.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.name} className="rounded-card border border-line p-5">
              <p className="font-mono text-sm font-medium text-copper">{t.name}</p>
              <p className="mt-1 font-mono text-xs text-faint">{t.sig}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-24 md:pb-32">
        <div className="rounded-media bg-stone px-6 py-14 md:px-14">
          <SectionLabel>No lock-in</SectionLabel>
          <h2 className="display-section mt-4 max-w-2xl">Your corpus is a file you can leave with.</h2>
          <p className="mt-4 max-w-xl text-muted">
            One click (or one API call) exports everything as portable JSON: content,
            versions, provenance, the lot. If Cairn stops earning its place, take your
            work and go. That promise is load-bearing.
          </p>
          <CodeSnippet>{`GET /api/export   →  cairn-corpus.json   # every asset, every version, all provenance`}</CodeSnippet>
        </div>
      </Section>
    </main>
  );
}
