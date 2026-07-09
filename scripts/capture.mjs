/* Captures every screenshot used on the marketing site from the running demo,
   so imagery never drifts from reality. Usage:
     npm run build && npx next start -p 3777 &
     node scripts/capture.mjs [baseUrl]
   Writes public/shots/*.png at 1440x900 @2x, light mode. */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3777";
const OUT = new URL("../public/shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function demoPage(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=The Cairn demo");
  await page.waitForSelector('nav[aria-label="Demo sections"]');
  await page.evaluate(() => document.fonts.ready);
  // shots show the product, not the site chrome around it
  await page.addStyleTag({ content: "header, footer { display: none !important; }" });
  return page;
}

/** Scroll the demo tab bar to the top of the viewport for a consistent frame. */
async function frameOnTabs(page) {
  await page.evaluate(() => {
    const tabs = document.querySelector('nav[aria-label="Demo sections"]');
    if (tabs) {
      const y = tabs.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo(0, y);
    }
  });
  await page.waitForTimeout(400);
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log(`✓ ${name}.png`);
}

const jobs = [
  {
    name: "home-hero",
    run: async (page) => {
      await frameOnTabs(page);
    },
  },
  {
    name: "product-library",
    run: async (page) => {
      await page.fill('input[aria-label="Search assets"]', "pricing");
      await page.waitForTimeout(500);
      await frameOnTabs(page);
    },
  },
  {
    name: "product-diff",
    run: async (page) => {
      await page.getByRole("button", { name: /Pricing table/ }).first().click();
      await page.waitForSelector("text=Version diff");
      await page.evaluate(() => {
        const el = [...document.querySelectorAll("h3")].find((h) => h.textContent === "Version diff");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo(0, y);
        }
      });
      await page.waitForTimeout(400);
    },
  },
  {
    name: "product-provenance",
    run: async (page) => {
      await page.getByRole("button", { name: /Onboarding email sequence/ }).first().click();
      await page.waitForSelector("text=Provenance");
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 120));
      await page.waitForTimeout(300);
    },
  },
  {
    name: "product-review",
    run: async (page) => {
      await page.click('nav[aria-label="Demo sections"] >> text=Review');
      await page.waitForTimeout(400);
      await frameOnTabs(page);
    },
  },
  {
    name: "demo-strip",
    run: async (page) => {
      await page.click('nav[aria-label="Demo sections"] >> text=Review');
      await page.waitForTimeout(400);
      await frameOnTabs(page);
    },
  },
  {
    name: "product-analytics",
    run: async (page) => {
      await page.click('nav[aria-label="Demo sections"] >> text=Analytics');
      await page.waitForSelector("text=Creation velocity");
      await page.waitForTimeout(500);
      await frameOnTabs(page);
    },
  },
  {
    name: "product-audit",
    run: async (page) => {
      await page.click('nav[aria-label="Demo sections"] >> text=Activity');
      await page.waitForSelector("text=Activity feed");
      await page.waitForTimeout(500);
      await frameOnTabs(page);
    },
  },
];

for (const job of jobs) {
  // fresh context per shot: clean localStorage, deterministic seed state
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await demoPage(context);
  await job.run(page);
  await shot(page, job.name);
  await context.close();
}

await browser.close();
console.log("done");
