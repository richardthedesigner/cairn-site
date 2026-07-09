# cairn-site

Marketing site and in-browser demo for **Cairn**, the system of record for AI-generated work.

- Next.js App Router, TypeScript strict, Tailwind v4. Fully static.
- `/demo` runs the product experience client-side: a `BrowserStore` over localStorage with a seeded corpus (`demo/seed.ts`), live search, version diffs, a review queue, analytics computed from events, and a scripted agent replay that really executes against the store.
- Screenshots are captured from the running demo with `scripts/capture.mjs` (Playwright), never mocked up.

## Develop

```sh
npm install
npm run dev
```

## Regenerate screenshots

```sh
npm run build && npx next start -p 3777 &
node scripts/capture.mjs
```

## Deploy

Vercel, git-connected. Push to `master` deploys production.
