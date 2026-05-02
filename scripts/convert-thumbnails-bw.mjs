#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PROJECTS_DIR = path.resolve("public/projects");

// Slugs whose source thumbnails are still colored.  We convert each into a
// crisp manga-ink panel: hard contrast, deep blacks, paper whites, with a
// thin ink border so the card edge reads as a panel boundary.
const SLUGS = [
  "coup",
  "typeduel",
  "tidewatcher",
  "ghgarden",
  "netmap",
  "litestats",
  "screencap",
  "recopy",
];

// Source UIs with light/white backgrounds get negated so every project
// thumbnail reads as ink-on-paper at the same value range.  Without this
// the light-bg thumbnails (Recopy, LiteStats, ScreenCap) disappear into
// the cream panel background.
const INVERT_SLUGS = new Set(["recopy", "litestats", "screencap"]);

const OUT_W = 512;
const OUT_H = 320;
const PAPER = { r: 0xff, g: 0xfd, b: 0xf7 };

async function processOne(slug) {
  const src = path.join(PROJECTS_DIR, `${slug}.webp`);
  const dst = path.join(PROJECTS_DIR, `${slug}-bw.webp`);

  let pipeline = sharp(src)
    .resize(OUT_W, OUT_H, { fit: "cover", position: "center" })
    .greyscale()
    .normalise()
    .linear(1.55, -55) // stronger contrast push: deeper blacks, brighter whites
    .gamma(1.05)
    .sharpen({ sigma: 0.6 });

  if (INVERT_SLUGS.has(slug)) {
    pipeline = pipeline
      .negate({ alpha: false })
      // After inverting, push toward true black/white so light-bg UIs land in the right tonal range.
      .linear(1.4, -45);
  }

  const inkBuffer = await pipeline.toColourspace("b-w").png().toBuffer();

  // Composite onto pure paper white so the lights resolve to clean paper
  // (#fffdf7) instead of bleeding any residual gray.  No multiply: the
  // image already carries the full tonal range.
  const paper = await sharp({
    create: { width: OUT_W, height: OUT_H, channels: 3, background: PAPER },
  })
    .png()
    .toBuffer();

  const composed = await sharp(paper)
    .composite([{ input: inkBuffer, blend: "over" }])
    .webp({ quality: 84, effort: 5 })
    .toBuffer();

  await writeFile(dst, composed);

  return { slug, bytes: composed.byteLength };
}

const results = await Promise.all(SLUGS.map(processOne));
for (const r of results) {
  console.log(`  ${r.slug.padEnd(14)} -> ${r.slug}-bw.webp  (${(r.bytes / 1024).toFixed(1)} KB)`);
}
console.log(`done: ${results.length} thumbnails`);
