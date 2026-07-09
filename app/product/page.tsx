import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionLabel, Shot } from "@/components/marketing/bits";

export const metadata: Metadata = {
  title: "Product",
  description:
    "A walkthrough of Cairn: library and search, version diffs, the review queue, provenance, analytics, and legal-grade governance for AI-generated work.",
  alternates: { canonical: "/product" },
};

const SECTIONS = [
  {
    id: "library",
    label: "Library & search",
    title: "The corpus, browsable.",
    body: "Every asset your AI has made, in one place: full-text search plus facets for type, status, collection and model. The library answers in milliseconds what scrollback answers in minutes, if at all.",
    shot: "/shots/product-library.png",
    alt: "Cairn library with search and facet filters over a corpus of assets",
  },
  {
    id: "versions",
    label: "Asset detail & versions",
    title: "One document. A real history.",
    body: "Versions are immutable and diffable. When an agent improves the pricing table, that is v4 of the pricing table, not a sixth lookalike file. The current version is always unambiguous.",
    shot: "/shots/product-diff.png",
    alt: "Side-by-side version diff of a pricing document in Cairn",
  },
  {
    id: "review",
    label: "Review queue",
    title: "What your agents made while you slept.",
    body: "Machine-made work lands as drafts. The queue is where a human promotes the good ones to approved, the tier agents trust, or archives the rest. Judgement stays with you; typing does not.",
    shot: "/shots/product-review.png",
    alt: "Cairn review queue with approve and archive actions on agent drafts",
  },
  {
    id: "provenance",
    label: "Provenance",
    title: "Open the chat that made this.",
    body: "Every asset records its source conversation, model, prompt and lineage. Six months later, ‘where did this number come from?’ has an answer you can click.",
    shot: "/shots/product-provenance.png",
    alt: "Provenance panel showing source chat, model, prompt and derivation links",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "Know what your corpus is worth.",
    body: "Creation velocity, model mix, retrieval heatmaps, duplicate pressure. See what your agents actually reuse and what they keep trying to re-make.",
    shot: "/shots/product-analytics.png",
    alt: "Cairn analytics: creation velocity chart, model mix and retrieval share",
  },
  {
    id: "governance",
    label: "Governance & audit",
    title: "Legal-DMS discipline, AI-native subject.",
    body: "Immutable versions and an append-only audit log, inherited from how law firms manage documents. When AI output needs accounting for, and increasingly it does, the record already exists.",
    shot: "/shots/product-audit.png",
    alt: "Append-only activity feed recording every human and agent action",
  },
];

export default function ProductPage() {
  return (
    <main className="flex-1">
      <Section className="pt-20 pb-14 md:pt-28">
        <SectionLabel>Product</SectionLabel>
        <h1 className="display-hero mt-5 max-w-3xl">The shelf behind the workshop.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Chat tools are where work gets made. Cairn is where it lives afterwards:
          searchable, versioned, attributed, and ready to be used again.
        </p>
      </Section>

      {SECTIONS.map((s, i) => (
        <Section key={s.id} id={s.id} className="pb-20 md:pb-28">
          <div
            className={`grid items-center gap-10 lg:grid-cols-[1fr_1.35fr] ${
              i % 2 === 1 ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div className="lg:[direction:ltr]">
              <p className="mono-label text-copper">{s.label}</p>
              <h2 className="display-section mt-4">{s.title}</h2>
              <p className="mt-4 leading-relaxed text-muted">{s.body}</p>
            </div>
            <div className="lg:[direction:ltr]">
              <Shot src={s.shot} alt={s.alt} />
            </div>
          </div>
        </Section>
      ))}

      <Section className="pb-24 md:pb-32">
        <div className="rounded-media bg-band px-6 py-14 text-center text-band-ink md:px-14">
          <h2 className="display-section mx-auto max-w-2xl">See it with your own corpus in mind.</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-75">
            The demo runs the real experience over a seeded corpus, in your browser,
            with nothing to install.
          </p>
          <Link href="/demo" className="pill-primary mt-8 !bg-white !text-[#17171c]">
            Try the live demo
          </Link>
        </div>
      </Section>
    </main>
  );
}
