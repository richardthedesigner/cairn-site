import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionLabel } from "@/components/marketing/bits";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Cairn Solo is free, local-first, forever, and available now. Team and Enterprise tiers with shared spaces, approvals and compliance are on the waitlist.",
  alternates: { canonical: "/pricing" },
};

const TIERS = [
  {
    name: "Solo",
    price: "Free",
    cadence: "local-first, forever",
    status: "Available now",
    statusTone: "text-green",
    features: [
      "Unlimited assets and versions on your machine",
      "Full MCP server: every tool, every client",
      "Review queue, diffs, provenance, analytics",
      "Portable JSON export of the whole corpus",
    ],
    cta: { label: "Run it locally", href: "/docs", primary: true },
  },
  {
    name: "Team",
    price: "Waitlist",
    cadence: "per seat, monthly",
    status: "In design",
    statusTone: "text-amber",
    features: [
      "Shared spaces with per-collection access",
      "Approval workflows and reviewer roles",
      "SSO and directory sync",
      "Hosted sync between machines",
    ],
    cta: { label: "Join the waitlist", href: `mailto:${site.waitlistEmail}?subject=Cairn%20Team%20waitlist`, primary: false },
  },
  {
    name: "Enterprise",
    price: "Waitlist",
    cadence: "annual",
    status: "In design",
    statusTone: "text-amber",
    features: [
      "Compliance-grade audit export",
      "Provenance manifests for AI-disclosure duties (EU AI Act Art. 50 readiness)",
      "VPC or on-prem deployment",
      "Retention and legal-hold policies",
    ],
    cta: { label: "Talk to us", href: `mailto:${site.waitlistEmail}?subject=Cairn%20Enterprise`, primary: false },
  },
];

export default function PricingPage() {
  return (
    <main className="flex-1">
      <Section className="pt-20 pb-14 text-center md:pt-28">
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="display-hero mx-auto mt-5 max-w-3xl">Honest about what exists.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Solo is real software you can run today. Team and Enterprise are commitments
          we are taking names for, not products we are pretending to sell.
        </p>
      </Section>

      <Section className="pb-24 md:pb-32">
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div key={tier.name} className="flex flex-col rounded-card bg-stone p-7">
              <div className="flex items-baseline justify-between">
                <h2 className="display-card">{tier.name}</h2>
                <p className={`mono-label ${tier.statusTone}`}>{tier.status}</p>
              </div>
              <p className="mt-4 font-display text-4xl font-medium tracking-tight">{tier.price}</p>
              <p className="mt-1 text-sm text-muted">{tier.cadence}</p>
              <hr className="my-6 border-hairline" />
              <ul className="flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span aria-hidden className="mt-0.5 text-green">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.cta.href.startsWith("mailto:") ? (
                <a href={tier.cta.href} className={`${tier.cta.primary ? "pill-primary" : "pill-outline"} mt-8 justify-center`}>
                  {tier.cta.label}
                </a>
              ) : (
                <Link href={tier.cta.href} className={`${tier.cta.primary ? "pill-primary" : "pill-outline"} mt-8 justify-center`}>
                  {tier.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Waitlist is an email for now. You will get a reply from a person, not a sequence.
        </p>
      </Section>
    </main>
  );
}
