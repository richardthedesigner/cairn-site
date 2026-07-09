import type { Metadata } from "next";
import Link from "next/link";
import { CodeSnippet, Section, SectionLabel } from "@/components/marketing/bits";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs: quickstart",
  description:
    "Install Cairn, run the local daemon, register the MCP server with Claude Desktop or Claude Code, and make your first capture and retrieval.",
  alternates: { canonical: "/docs" },
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline py-8">
      <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
        <p className="mono-label text-copper">
          Step {n}
        </p>
        <div className="min-w-0">
          <h2 className="display-card">{title}</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main className="flex-1">
      <Section className="pt-20 pb-10 md:pt-28">
        <SectionLabel>Docs</SectionLabel>
        <h1 className="display-hero mt-5 max-w-3xl">Quickstart.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          From clone to your first agent-written, human-approved asset in about five
          minutes. Requires Node 20 or newer.
        </p>
      </Section>

      <Section className="pb-24 md:pb-32">
        <Step n={1} title="Install and run">
          <CodeSnippet>{`git clone ${site.productRepo}.git cairn
cd cairn
npm install
npm start`}</CodeSnippet>
          <p>
            The daemon starts on{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-xs">http://localhost:4800</code>{" "}
            with the web app, and creates its SQLite database at{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-xs">~/.damllm/loci.db</code>.
            Want demo data to explore first? Run{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-xs">npm run demo</code>.
          </p>
        </Step>

        <Step n={2} title="Register with Claude Code">
          <CodeSnippet>{`claude mcp add --scope user cairn -- node $PWD/packages/mcp/dist/index.js`}</CodeSnippet>
          <p>
            One line. Every Claude Code session on your machine can now read and write
            your corpus.
          </p>
        </Step>

        <Step n={3} title="Register with Claude Desktop">
          <p>
            Add this to{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-xs">
              claude_desktop_config.json
            </code>{" "}
            (Settings → Developer → Edit Config), then restart Claude Desktop:
          </p>
          <CodeSnippet>{`{
  "mcpServers": {
    "cairn": {
      "command": "node",
      "args": ["/absolute/path/to/cairn/packages/mcp/dist/index.js"]
    }
  }
}`}</CodeSnippet>
        </Step>

        <Step n={4} title="First capture">
          <p>In any registered session, ask your agent to keep something:</p>
          <CodeSnippet>{`> Keep this positioning brief in Cairn under the "positioning" collection.

# the agent calls:
write_asset({ title: "Positioning brief", type: "document",
              collection: "positioning", content: … })
→ created as draft a_x92kd, awaiting your review at localhost:4800`}</CodeSnippet>
          <p>
            Open the review queue and approve it. Approved is the tier agents read from
            by default.
          </p>
        </Step>

        <Step n={5} title="First retrieval">
          <CodeSnippet>{`> What does our positioning brief say about the wedge?

# the agent calls:
search_assets("positioning wedge")   → 1 hit (approved)
get_asset("a_x92kd")                 → the canonical version, with provenance`}</CodeSnippet>
          <p>
            That is the loop: no re-pasting, no stale copies, and every answer traceable
            to a reviewed source.
          </p>
        </Step>

        <div className="border-t border-hairline pt-8">
          <p className="text-sm text-muted">
            Prefer to try before installing? The{" "}
            <Link href="/demo" className="text-link">
              browser sandbox
            </Link>{" "}
            runs the whole experience with nothing on your machine.
          </p>
        </div>
      </Section>
    </main>
  );
}
