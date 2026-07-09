export const site = {
  name: "Cairn",
  tagline: "Your AI makes great work. Cairn keeps it.",
  description:
    "Cairn is the system of record for AI-generated work: everything your AI makes, findable, versioned, and ready for its next session.",
  url: "https://cairn-site.vercel.app",
  github: "https://github.com/richardthedesigner/cairn-site",
  productRepo: "https://github.com/richardthedesigner/damllm",
  localApp: "http://localhost:4800",
  healthEndpoint: "http://localhost:4800/api/health",
  waitlistEmail: "richard@tigerforest.co.uk",
  nameStory:
    "A cairn is a stack of stones that marks the path. Cairn marks and keeps every piece of work your AI produces, so you never walk the same ground twice.",
} as const;

export const nav = [
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
] as const;
