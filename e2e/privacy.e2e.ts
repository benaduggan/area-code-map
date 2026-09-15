/**
 * End-to-end privacy check against the production build.
 *
 *   bun run build && bun run e2e
 *
 * Boots `vite preview`, imports contacts, exercises search, share and
 * image export, and fails if the page makes ANY network request that is
 * not to the preview server itself. This is the executable version of
 * "your contacts never leave your browser".
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const PORT = 4179;
const BASE = `http://localhost:${PORT}/area-code-map/`;
// Locally, point CHROME_PATH at a Chromium binary; in CI `playwright install chromium` provides one.
const CHROME = process.env.CHROME_PATH;

const preview = spawn("bunx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
});
const cleanup = () => {
  preview.kill();
};
process.on("exit", cleanup);

async function waitForServer(): Promise<void> {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("preview server did not start");
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  cleanup();
  process.exit(1);
}

await waitForServer();
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const context = await browser.newContext({
  acceptDownloads: true,
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();

const foreignRequests: string[] = [];
const pageErrors: string[] = [];
page.on("request", (req) => {
  const url = req.url();
  if (
    !url.startsWith(`http://localhost:${PORT}/`) &&
    !url.startsWith("data:") &&
    !url.startsWith("blob:")
  ) {
    foreignRequests.push(url);
  }
});
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });

// Import via paste.
await page.click("text=Paste numbers");
await page.fill(
  "textarea",
  "(919) 555-0100, 919-555-0101, 212-555-0100, 415-555-0100, +44 20 7946 0958",
);
await page.click("text=Map these");
await page.waitForSelector("text=Your map");

const fill919 = await page.getAttribute('[data-shape="919"]', "style");
if (!fill919?.includes("fill")) fail("919 was not painted after import");

// Search, select, zoom.
await page.fill("input[type=search]", "raleigh");
await page.click("button.card >> nth=0");
await page.waitForTimeout(700);
await page.fill("input[type=search]", "");

// Share link carries counts in the hash and nothing in the path or query.
await page.click("text=Copy share link");
await page.waitForSelector("text=Link copied");
const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
const parsed = new URL(shareUrl);
if (
  parsed.origin !== `http://localhost:${PORT}` ||
  parsed.pathname !== "/area-code-map/" ||
  parsed.search !== ""
) {
  fail(`unexpected share URL ${shareUrl}`);
}
if (!parsed.hash.startsWith("#v1.")) fail(`share URL has no v1 hash payload: ${shareUrl}`);

// Opening the link in a fresh page shows the shared map.
const viewer = await context.newPage();
viewer.on("request", (req) => {
  const url = req.url();
  if (
    !url.startsWith(`http://localhost:${PORT}/`) &&
    !url.startsWith("data:") &&
    !url.startsWith("blob:")
  ) {
    foreignRequests.push(url);
  }
});
await viewer.goto(shareUrl, { waitUntil: "networkidle" });
await viewer.waitForSelector("text=shared map");
await viewer.close();

// PNG export triggers a download.
const [download] = await Promise.all([
  page.waitForEvent("download", { timeout: 15000 }),
  page.click("text=Download image"),
]);
if (download.suggestedFilename() !== "area-code-map.png")
  fail(`unexpected download name ${download.suggestedFilename()}`);
const path = await download.path();
if (!path) fail("download had no file");

// Give any stray beacon a moment, then assert.
await page.waitForTimeout(500);
await browser.close();
cleanup();

if (pageErrors.length) fail(`page errors: ${pageErrors.join("; ")}`);
if (foreignRequests.length) fail(`network requests left the page: ${foreignRequests.join(", ")}`);
console.log("PASS: import, search, export worked with zero external network requests");
