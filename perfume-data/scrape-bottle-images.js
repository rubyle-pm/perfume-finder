/**
 * scrape-bottle-images.js  (Puppeteer version)
 *
 * ONE-TIME offline script. Never runs in production.
 *
 * What it does:
 *   1. Opens Fragrantica search in a real headless browser (bypasses 403)
 *   2. Finds the product page, extracts the bottle image URL
 *   3. Downloads and saves to: ../public/perfume-image/perfume-bottles/{id}.jpg
 *
 * Usage (run from perfume-data/ folder):
 *   npm install puppeteer                      ← one-time, ~170MB Chromium download
 *   node scrape-bottle-images.js --dry-run     ← test first 5 entries
 *   node scrape-bottle-images.js               ← full 218
 *   node scrape-bottle-images.js --retry       ← retry failed entries only
 *
 * Output:
 *   ../public/perfume-image/perfume-bottles/{id}.jpg   ← bottle images
 *   ./scrape-log.json                                   ← per-entry status log
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ─── Helper functions ─────────────────────────────────────────────────────
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreResult(textRaw, entry) {
  const text = normalize(textRaw);
  const targetName = normalize(entry.name);
  const brand = normalize(entry.brand);
  // also check full brand name from slug map
  const fullBrandName = normalize(getBrandSlug(entry.brand).replace(/-/g, " "));

  let score = 0;
  if (text.includes(brand) || text.includes(fullBrandName)) score += 5;

  // Base Name Tokens Verification
  const baseName = normalize(entry.name.replace(/\b(edp|edt|parfum|intense|extreme|elixir|absolu)\b/gi, ""));
  const baseTokens = baseName.split(" ").filter(Boolean);

  let matchCount = 0;
  baseTokens.forEach(token => {
    if (text.includes(token)) matchCount++;
  });

  if (matchCount === 0) return -100; // Instantly kill unrelated perfumes
  else score += (matchCount * 3);

  // Symmetric Variant Checking (omitting parfum as it's concentration logic)
  const variantWords = ["intense", "extreme", "elixir", "edition", "collector", "limited", "absolu", "absolue"];
  const textTokens = text.split(" ").filter(Boolean);
  const targetTokens = targetName.split(" ").filter(Boolean);

  variantWords.forEach(variant => {
    const wantsVariant = targetTokens.includes(variant);
    const hasVariant = textTokens.includes(variant);

    // Reward matching, punish mismatching
    if (wantsVariant && hasVariant) score += 10;
    if (wantsVariant && !hasVariant) score -= 10;
    if (!wantsVariant && hasVariant) score -= 10;
  });

  // Concentration (EDP vs EDT) Verification
  if (entry.concentration === "EDT") {
    if (text.includes("eau de toilette") || text.includes("edt")) score += 8;
    if (text.includes("eau de parfum") || text.includes("edp")) score -= 10;
  }

  if (entry.concentration === "EDP") {
    if (text.includes("eau de parfum") || text.includes("edp")) score += 8;
    if (text.includes("eau de toilette") || text.includes("edt")) score -= 10;
  }

  // Regex Gender Validation (Space-boundaried against false positive substring matches)
  const isTargetFem = entry.gender === "feminine";
  const isTargetMasc = entry.gender === "masculine";

  // Padding with spaces guarantees \b acts predictably
  const paddedText = ` ${text} `;
  const hasWomen = /\b(women|woman|pour femme|for her)\b/.test(paddedText);
  const hasMen = /\b(men|man|pour homme|for him)\b/.test(paddedText);

  if (isTargetFem) {
    if (hasWomen) score += 5;
    if (hasMen && !hasWomen) score -= 15;
  } else if (isTargetMasc) {
    if (hasMen) score += 5;
    if (hasWomen && !hasMen) score -= 15;
  }

  // Penalty for excessive extra words (Flanker/Year penalty)
  // Safely ignore brand tokens before penalizing for extra text
  const brandTokens = new Set([...brand.split(" "), ...fullBrandName.split(" ")].filter(Boolean));
  const nonBrandTextTokens = textTokens.filter(t => !brandTokens.has(t));

  if (nonBrandTextTokens.length > targetTokens.length) {
    const diff = nonBrandTextTokens.length - targetTokens.length;
    score -= Math.min(diff, 5); // cap at -5 to prevent ruin by metadata dates/votes
  }

  return score;
}

// ─── Config ────────────────────────────────────────────────────────────────
const DATASET_PATH = "./perfume_dataset.json";
const OUTPUT_DIR = "../public/perfume-image/perfume-bottles";
const LOG_PATH = "./scrape-log.json";
const DRY_RUN = process.argv.includes("--dry-run");
const RETRY_FAILED = process.argv.includes("--retry");
const DELAY_MS = 2000; // ms between entries — be polite to Fragrantica

// ─── Brand → Fragrantica URL slug map ─────────────────────────────────────
// Fragrantica uses specific brand slugs in their URLs.
// Format: "Your dataset brand name": "Fragrantica-URL-Slug"
const BRAND_SLUG_MAP = {
  "YSL": "Yves-Saint-Laurent",
  "Dior": "Christian-Dior",
  "Chanel": "Chanel",
  "Chloé": "Chloe",
  "Lancôme": "Lancome",
  "Frédéric Malle": "Frederic-Malle",
  "Dolce & Gabbana": "Dolce-and-Gabbana",
  "Viktor & Rolf": "Viktor-and-Rolf",
  "Maison Francis Kurkdjian": "Maison-Francis-Kurkdjian",
  "Maison Margiela": "Maison-Margiela",
  "Parfums de Marly": "Parfums-de-Marly",
  "Penhaligon's": "Penhaligons",
  "Acqua di Parma": "Acqua-di-Parma",
  "Jo Malone": "Jo-Malone-London",
  "Tom Ford": "Tom-Ford",
  "Le Labo": "Le-Labo",
  "Byredo": "Byredo",
  "Creed": "Creed",
  "Guerlain": "Guerlain",
  "Hermès": "Hermes",
  "Giorgio Armani": "Giorgio-Armani",
  "Givenchy": "Givenchy",
  "Gucci": "Gucci",
  "Prada": "Prada",
  "Paco Rabanne": "Paco-Rabanne",
  "Valentino": "Valentino",
  "Carolina Herrera": "Carolina-Herrera",
  "Jean Paul Gaultier": "Jean-Paul-Gaultier",
  "Narciso Rodriguez": "Narciso-Rodriguez",
  "Mugler": "Thierry-Mugler",
  "Bvlgari": "Bvlgari",
  "Cartier": "Cartier",
  "Loewe": "Loewe",
  "Diptyque": "Diptyque",
  "Kilian": "By-Kilian",
  "Amouage": "Amouage",
  "Initio Parfums": "Initio-Parfums-Prives",
  "Xerjoff": "Xerjoff",
  "Roja Parfums": "Roja-Parfums",
  "Serge Lutens": "Serge-Lutens",
  "Atelier Cologne": "Atelier-Cologne",
  "Clive Christian": "Clive-Christian",
  "Ex Nihilo": "Ex-Nihilo",
  "Juliette Has A Gun": "Juliette-Has-a-Gun",
  "Memo Paris": "Memo",
  "Vilhelm Parfumerie": "Vilhelm-Parfumerie",
};

function getBrandSlug(brand) {
  return BRAND_SLUG_MAP[brand] || brand.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

// Strip concentration and flankers before searching to cast a wide net
function searchName(name) {
  return name
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\b(edp|edt|eau de parfum|eau de toilette|edc|extrait|parfum|intense|extreme|elixir|edition|collector|limited|absolu|absolue)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Image download (plain https, no Puppeteer needed) ────────────────────
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    client
      .get(url, { headers: { Referer: "https://www.fragrantica.com/" } }, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          return reject(new Error(`Image download HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Scrape one entry using an open Puppeteer page ────────────────────────
async function scrapeEntry(page, entry) {
  const { brand, name } = entry;
  const query = encodeURIComponent(`${brand} ${searchName(name)}`);
  const searchUrl = `https://www.fragrantica.com/search/?query=${query}`;

  // Step 1: search page
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
  await sleep(1500);

  // Step 2: find first valid product link
  // Fragrantica product URLs: /perfume/Brand-Slug/Name-NUMERICID.html
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/perfume/"]'))
      .filter(a =>
        /\/perfume\/[^/]+\/[^/]+-\d+\.html/.test(a.href) &&
        !a.href.includes("/news/") &&
        !a.href.includes("/magazine/")
      )
      .map(a => ({
        text: a.innerText,
        url: a.href
      }));
  });

  if (!results.length) throw new Error("No product links found");

  // 👉 SCORE + RANK
  const scored = results.map(r => ({
    ...r,
    score: scoreResult(r.text, entry)
  }));

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  console.log(`  🎯 best match: ${best.text} | score=${best.score}`);

  if (!best || best.score < 0) {
    throw new Error(`No confident match heavily outweighed penalties (best score = ${best?.score || 0})`);
  }

  const productUrl = best.url;

  // Step 3: product page
  await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
  await sleep(1000);

  // Grab the entire text footprint of the product page
  const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());

  // 1. Validate Target Notes (Ultimate Check)
  const targetNotes = [
    ...(entry.top_notes || []),
    ...(entry.heart_notes || []),
    ...(entry.base_notes || [])
  ];

  let matchedNotes = 0;
  targetNotes.forEach(note => {
    if (pageText.includes(note.toLowerCase())) matchedNotes++;
  });

  if (targetNotes.length > 0 && matchedNotes < 2) {
    throw new Error(`Product page failed validation. Only found ${matchedNotes} matching notes.`);
  }

  // 2. Concentration fallback check
  if (entry.concentration === 'EDP' && pageText.includes("eau de toilette") && !pageText.includes("eau de parfum")) {
    throw new Error("Product page verified it is an EDT, but we need EDP.");
  }

  // Step 4: extract bottle image URL
  // Fragrantica stores bottle images on fimgs.net CDN
  const imageUrl = await page.evaluate(() => {
    const selectors = [
      'img[itemprop="image"]',
      'img[src*="fimgs.net"][src*="375x500"]',
      'img[src*="fimgs.net"]',
      "#mainpicId img",
      ".mainpicId img",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el?.src?.includes("fimgs.net")) return el.src;
    }
    // Last fallback: og:image meta
    const og = document.querySelector('meta[property="og:image"]');
    return og?.content || null;
  });

  if (!imageUrl) throw new Error("Bottle image not found on product page");

  return { productUrl, imageUrl };
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Check puppeteer is installed
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error([
      "",
      "✗  Puppeteer not installed.",
      "   Run this first:  npm install puppeteer",
      "   (Downloads ~170MB Chromium — one time only)",
      "",
    ].join("\n"));
    process.exit(1);
  }

  // Load data
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
  let log = fs.existsSync(LOG_PATH)
    ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8"))
    : {};

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Decide which entries to process
  let entries = dataset;
  if (RETRY_FAILED) {
    const failedIds = new Set(
      Object.entries(log)
        .filter(([, v]) => v.status === "failed")
        .map(([k]) => k)
    );
    entries = dataset.filter((d) => failedIds.has(d.id));
    console.log(`\nRetrying ${entries.length} failed entries...\n`);
  } else if (DRY_RUN) {
    entries = dataset.slice(0, 5);
    console.log(`\nDry run — processing first 5 entries...\n`);
  } else {
    console.log(`\nFull run — ${entries.length} entries (~${Math.ceil(entries.length * (DELAY_MS + 4000) / 60000)} min)...\n`);
  }

  // Launch headless browser
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  // Disguise as a real browser — key to bypassing Fragrantica's bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  console.log("Browser ready.\n");

  let okCount = 0, skipCount = 0, failCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const { id } = entry;
    const destPath = path.join(OUTPUT_DIR, `${id}.jpg`);

    console.log(`[${i + 1}/${entries.length}] ${id}`);

    // Skip if already downloaded and looks like a real image (>5KB)
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      console.log(`  ⊙ already exists — skipping`);
      log[id] = { status: "skipped", path: destPath };
      skipCount++;
      continue;
    }

    try {
      const { productUrl, imageUrl } = await scrapeEntry(page, entry);
      console.log(`  ✓ found   ${productUrl}`);
      console.log(`    image   ${imageUrl}`);

      await downloadImage(imageUrl, destPath);
      console.log(`    saved → ${destPath}`);

      log[id] = { status: "ok", productUrl, imageUrl, path: destPath };
      okCount++;
    } catch (err) {
      console.log(`  ✗ failed: ${err.message}`);
      log[id] = { status: "failed", error: err.message, brand: entry.brand, name: entry.name };
      failCount++;
    }

    // Write log after every entry so a crash loses at most 1 entry
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

    if (i < entries.length - 1) await sleep(DELAY_MS);
  }

  await browser.close();

  // Summary
  console.log(`\n─────────────────────────────────────`);
  console.log(`Done.`);
  console.log(`  ✓ downloaded : ${okCount}`);
  console.log(`  ⊙ skipped    : ${skipCount}`);
  console.log(`  ✗ failed     : ${failCount}`);

  if (failCount > 0) {
    console.log(`\nFailed entries (run --retry to attempt again):`);
    Object.entries(log)
      .filter(([, v]) => v.status === "failed")
      .forEach(([id, v]) => console.log(`  ${id}  →  ${v.error}`));
  }
  console.log(`\nLog saved to: ${LOG_PATH}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
