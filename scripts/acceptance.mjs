/* Acceptance checks for the demo (brief §11.3-4), driven against a live URL.
   Usage: node scripts/acceptance.mjs [baseUrl]                              */

import { chromium } from "playwright";

const BASE = process.argv[2] ?? "https://cairn-site-sigma.vercel.app";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` (${detail})` : ""}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

async function openDemo() {
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await page.waitForSelector('nav[aria-label="Demo sections"]');
}

// 1. search returns sensible results
await openDemo();
await page.fill('input[aria-label="Search assets"]', "pricing");
await page.waitForTimeout(400);
const firstTitle = await page.locator("ul.divide-y li button span span").first().textContent();
check("search returns sensible results", /pricing/i.test(firstTitle ?? ""), `top hit: ${firstTitle}`);

// 2. diff view renders a real two-version diff
await page.getByRole("button", { name: /Pricing table/ }).first().click();
await page.waitForSelector("text=Version diff");
const diffStats = await page.locator("text=/\\+\\d+ −\\d+ lines/").first().textContent();
const diffRows = await page.locator("table tr").count();
check("diff renders a real two-version diff", diffRows > 10 && /\+\d+/.test(diffStats ?? ""), `${diffRows} rows, ${diffStats?.trim()}`);

// 3. approve flow moves a draft to approved (and survives reload)
await openDemo();
await page.click('nav[aria-label="Demo sections"] >> text=Review');
await page.waitForTimeout(300);
const before = await page.locator("ul.space-y-3 > li").count();
await page.locator("button", { hasText: "Approve" }).first().click();
await page.waitForTimeout(400);
const after = await page.locator("ul.space-y-3 > li").count();
check("approve moves a draft out of the queue", after === before - 1, `${before} → ${after}`);

await page.reload({ waitUntil: "networkidle" });
await page.click('nav[aria-label="Demo sections"] >> text=Review');
await page.waitForTimeout(400);
const afterReload = await page.locator("ul.space-y-3 > li").count();
check("state survives reload", afterReload === after, `${afterReload} in queue after reload`);

// 4. agent replay runs end-to-end incl. the duplicate rejection
await openDemo();
await page.getByRole("button", { name: /Watch an agent use Cairn/ }).first().click();
await page.waitForSelector("text=/rejected. duplicate: near/", { timeout: 90_000 });
check("agent replay completes with duplicate rejection", true);
await page.click('nav[aria-label="Demo sections"] >> text=Review');
await page.waitForTimeout(300);
const hasAgentDraft = await page.locator("text=Q3 pricing experiment brief").count();
check("replay's draft landed in the review queue", hasAgentDraft > 0);

// 5. reset restores the seed
page.once("dialog", (d) => d.accept());
await page.getByRole("button", { name: "Reset demo" }).click();
await page.waitForTimeout(600);
await page.click('nav[aria-label="Demo sections"] >> text=Review');
await page.waitForTimeout(300);
const resetCount = await page.locator("ul.space-y-3 > li").count();
check("reset restores the seeded queue", resetCount === 7, `${resetCount} in queue (seed has 7)`);

// 6. "Open app" falls back to /demo when no daemon answers
const p2 = await context.newPage();
await p2.route("**/api/health", (route) => route.abort());
await p2.goto(BASE, { waitUntil: "networkidle" });
await p2.getByRole("button", { name: /Open app/ }).first().click();
await p2.waitForURL("**/demo?fallback=1", { timeout: 10_000 });
const note = await p2.locator("text=No local Cairn found").count();
check("Open app falls back to /demo with note", note > 0);
await p2.close();

// 7. "Open app" reaches a running local daemon (only meaningful on the dev machine)
const p3 = await context.newPage();
await p3.goto(BASE, { waitUntil: "networkidle" });
try {
  await p3.getByRole("button", { name: /Open app/ }).first().click();
  await p3.waitForURL("http://localhost:4800/**", { timeout: 8_000 });
  check("Open app reaches the local daemon when running", true);
} catch {
  check("Open app reaches the local daemon when running", false, "no daemon on this machine (skip if not dev box)");
}
await p3.close();

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
