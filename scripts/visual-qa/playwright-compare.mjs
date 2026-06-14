import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Script lives in scripts/visual-qa/; the repo root is two dirs up.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = process.env.BURRO_VISUAL_QA_OUT ?? path.join(os.tmpdir(), "burro-playwright-visual-qa");
const baseUrl = process.env.BURRO_VISUAL_QA_BASE_URL ?? "http://127.0.0.1:5173";
// chromePath: when unset we let Playwright use its bundled chromium.
const chromePath = process.env.BURRO_VISUAL_QA_CHROME_PATH || undefined;
// runtimeNodeModules: optional override pointing at an external node_modules
// (e.g. a Codex runtime cache). Default: resolve via the script's own node_modules.
const runtimeNodeModules = process.env.BURRO_VISUAL_QA_RUNTIME_NODE_MODULES || null;
const resolveDep = runtimeNodeModules
  ? createRequire(`${runtimeNodeModules}/`).resolve
  : (name) => name;
const playwrightMod = await import(resolveDep("playwright"));
const chromium = playwrightMod.chromium ?? playwrightMod.default?.chromium;
const { default: pixelmatch } = await import(resolveDep("pixelmatch"));
const { PNG } = await import(resolveDep("pngjs"));
const { default: sharp } = await import(resolveDep("sharp"));

const scenarios = [
  {
    id: "dashboard",
    route: "/dashboard",
    ref: "docs/design/reference-screens/04-home-dashboard.png",
    ready: ".dashboard-screen",
    beforeGoto: async (page) => {
      await page.addInitScript(() => {
        localStorage.setItem("burro.modules.view", "grid");
      });
    }
  },
  {
    id: "modules-grid",
    route: "/modules",
    ref: "docs/design/reference-screens/19-modules-grid.png",
    ready: ".modules-grid",
    beforeGoto: async (page) => {
      await page.addInitScript(() => {
        localStorage.setItem("burro.modules.view", "grid");
      });
    }
  },
  {
    id: "exercise-default",
    route: "/modules/75a2d16b-6bac-520c-8fac-931debf47b02/practice",
    ref: "docs/design/reference-screens/05-exercise-letter-default.png",
    ready: ".exercise-screen-shell, .exercise-card, .exercise-screen"
  },
  {
    id: "leaderboard",
    route: "/leaderboard",
    ref: "docs/design/reference-screens/01-leaderboard.png",
    ready: ".leaderboard-screen"
  }
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  ...(chromePath ? { executablePath: chromePath } : {}),
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"]
});

const captureResults = [];

for (const scenario of scenarios) {
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const consoleMessages = [];

  page.on("console", (message) => {
    const text = message.text();
    if (!text.includes("Download the React DevTools")) {
      consoleMessages.push({ type: message.type(), text });
    }
  });
  page.on("pageerror", (error) => {
    consoleMessages.push({ type: "pageerror", text: String(error.message || error) });
  });

  if (scenario.beforeGoto) {
    await scenario.beforeGoto(page);
  }

  let captureError = null;
  try {
    await page.goto(`${baseUrl}${scenario.route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.locator(scenario.ready).first().waitFor({ state: "visible", timeout: 12000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(500);
  } catch (err) {
    captureError = String(err.message || err);
  }

  const livePath = path.join(outDir, `${scenario.id}.live.png`);
  try { await page.screenshot({ path: livePath, fullPage: false }); } catch (e) { captureError = (captureError ? captureError + " | " : "") + "screenshot: " + String(e.message || e); }

  const boxes = await page.evaluate(() => {
    const selectors = [
      ".phone",
      ".dashboard-top",
      ".bottom-nav",
      ".glass-card",
      ".daily-task",
      ".result-card",
      ".modules-grid",
      ".student-module-card",
      ".progress-header",
      ".exercise-card",
      ".answer-grid",
      ".podium",
      ".rank-row",
      ".pinned-rank"
    ];

    return selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector)).slice(0, 8).map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          selector,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      })
    );
  });

  captureResults.push({
    id: scenario.id,
    route: scenario.route,
    livePath,
    refPath: path.join(repo, scenario.ref),
    consoleMessages,
    boxes,
    captureError
  });
  await context.close();
}

await browser.close();

const diffResults = [];
const rowComposites = [];

for (const result of captureResults) {
  const refPng = PNG.sync.read(await fs.readFile(result.refPath));
  const livePng = PNG.sync.read(await fs.readFile(result.livePath));

  if (refPng.width !== livePng.width || refPng.height !== livePng.height) {
    throw new Error(`${result.id}: dimension mismatch ref ${refPng.width}x${refPng.height}, live ${livePng.width}x${livePng.height}`);
  }

  const diffPng = new PNG({ width: refPng.width, height: refPng.height });
  const mismatchedPixels = pixelmatch(refPng.data, livePng.data, diffPng.data, refPng.width, refPng.height, {
    threshold: 0.12,
    includeAA: true,
    alpha: 0.25,
    diffColor: [255, 0, 64],
    aaColor: [255, 200, 0]
  });
  const totalPixels = refPng.width * refPng.height;
  const diffPath = path.join(outDir, `${result.id}.diff.png`);
  await fs.writeFile(diffPath, PNG.sync.write(diffPng));

  const mismatchPercent = Number(((mismatchedPixels / totalPixels) * 100).toFixed(2));
  const labelSvg = Buffer.from(`
    <svg width="1206" height="44" xmlns="http://www.w3.org/2000/svg">
      <rect width="1206" height="44" fill="#081b4a"/>
      <text x="16" y="29" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff">${result.id} · reference</text>
      <text x="418" y="29" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff">implementation</text>
      <text x="820" y="29" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#fff">diff ${mismatchPercent}%</text>
    </svg>
  `);
  const rowPath = path.join(outDir, `${result.id}.row.png`);

  await sharp({
    create: {
      width: 1206,
      height: 918,
      channels: 4,
      background: "#061437"
    }
  })
    .composite([
      { input: labelSvg, left: 0, top: 0 },
      { input: result.refPath, left: 0, top: 44 },
      { input: result.livePath, left: 402, top: 44 },
      { input: diffPath, left: 804, top: 44 }
    ])
    .png()
    .toFile(rowPath);

  rowComposites.push(rowPath);
  diffResults.push({
    id: result.id,
    route: result.route,
    mismatchPercent,
    mismatchedPixels,
    totalPixels,
    refPath: result.refPath,
    livePath: result.livePath,
    diffPath,
    rowPath,
    consoleMessages: result.consoleMessages,
    boxes: result.boxes
  });
}

const sheetPath = path.join(outDir, "visual-diff-sheet.png");
await sharp({
  create: {
    width: 1206,
    height: rowComposites.length * 918,
    channels: 4,
    background: "#061437"
  }
})
  .composite(rowComposites.map((input, index) => ({ input, left: 0, top: index * 918 })))
  .png()
  .toFile(sheetPath);

const reportPath = path.join(outDir, "report.json");
await fs.writeFile(reportPath, JSON.stringify({ outDir, sheetPath, results: diffResults }, null, 2));

console.log(JSON.stringify({
  outDir,
  sheetPath,
  reportPath,
  results: diffResults.map(({ boxes, ...rest }) => rest)
}, null, 2));
