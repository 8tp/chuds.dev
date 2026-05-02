#!/usr/bin/env node
/**
 * Generate a manga-ink thumbnail for AntMaze that mirrors the actual game
 * render pipeline (see /Users/huntermeherin/Personal/games/AntMaze/ant-maze/src/renderer.ts).
 *
 * The real game uses brown/tan colors; we re-tone here to ink-on-paper:
 *   - bg:    panel cream (matches site)
 *   - path:  paper (slightly warmer than bg)
 *   - walls: ink (thick, rounded caps, mirrors WALL_THICKNESS = 4)
 *   - ant:   ink (3-segment body + antennae + 6 legs, mirrors drawAnt)
 *   - HUD:   inverted (black bar, cream text) like the in-game HUD
 *   - goal:  dotted ring (instead of pulsing green)
 *
 * Output: public/projects/antmaze-bw.webp
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 512;
const H = 320;

// Layout: HUD bar at top, maze fills the rest.
const HUD_H = 28;
const TILE = 24;
const COLS = 9;
const ROWS = 5;
const MAZE_W = TILE * COLS;
const MAZE_H = TILE * ROWS;
const OFFSET_X = Math.floor((W - MAZE_W) / 2);
const OFFSET_Y = HUD_H + Math.floor((H - HUD_H - MAZE_H) / 2);

const PAPER = "#fffdf7";
const PATH = "#fffdf7";
const BG = "#0d0d0d";
const INK = "#0d0d0d";
const SHADOW = "#1a1a1a";

const WALL_THICKNESS = 3;

// Maze laid out as cells with wall edges. Each cell has 4 walls (top/right/bottom/left).
// I designed this by hand to read clearly at thumbnail size — a single
// solvable path threads from start (0,0) to goal (last col, last row),
// with branches that look maze-like but readable.
function makeMaze(rows, cols) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ top: true, right: true, bottom: true, left: true });
    }
    cells.push(row);
  }

  // Carve via simple recursive backtracker so the layout is plausible.
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, 0]];
  visited[0][0] = true;

  // deterministic PRNG so the thumbnail is reproducible
  let seed = 0xc0ffee;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const neighbors = [];
    if (r > 0 && !visited[r - 1][c]) neighbors.push([r - 1, c, "top"]);
    if (c < cols - 1 && !visited[r][c + 1]) neighbors.push([r, c + 1, "right"]);
    if (r < rows - 1 && !visited[r + 1][c]) neighbors.push([r + 1, c, "bottom"]);
    if (c > 0 && !visited[r][c - 1]) neighbors.push([r, c - 1, "left"]);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const [nr, nc, dir] = neighbors[Math.floor(rand() * neighbors.length)];
    if (dir === "top") {
      cells[r][c].top = false;
      cells[nr][nc].bottom = false;
    } else if (dir === "right") {
      cells[r][c].right = false;
      cells[nr][nc].left = false;
    } else if (dir === "bottom") {
      cells[r][c].bottom = false;
      cells[nr][nc].top = false;
    } else {
      cells[r][c].left = false;
      cells[nr][nc].right = false;
    }
    visited[nr][nc] = true;
    stack.push([nr, nc]);
  }

  return cells;
}

const maze = makeMaze(ROWS, COLS);

const wallLines = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cell = maze[r][c];
    const x = OFFSET_X + c * TILE;
    const y = OFFSET_Y + r * TILE;
    if (cell.top) {
      wallLines.push(`<line x1="${x}" y1="${y}" x2="${x + TILE}" y2="${y}"/>`);
    }
    if (cell.right) {
      wallLines.push(`<line x1="${x + TILE}" y1="${y}" x2="${x + TILE}" y2="${y + TILE}"/>`);
    }
    if (cell.bottom) {
      wallLines.push(`<line x1="${x}" y1="${y + TILE}" x2="${x + TILE}" y2="${y + TILE}"/>`);
    }
    if (cell.left) {
      wallLines.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + TILE}"/>`);
    }
  }
}

// Ant pose: roughly center-left, facing right, mid-corridor of row 1, col 4.
const antCol = 4;
const antRow = 1;
const antX = OFFSET_X + antCol * TILE + TILE / 2;
const antY = OFFSET_Y + antRow * TILE + TILE / 2;

// Goal pose: bottom-right cell.
const goalX = OFFSET_X + (COLS - 1) * TILE + TILE / 2;
const goalY = OFFSET_Y + (ROWS - 1) * TILE + TILE / 2;

// Mirror drawAnt() proportions from renderer.ts.
const s = TILE * 0.42;
function antSvg(cx, cy) {
  // facing right (angle = 0).
  const parts = [];
  // abdomen, thorax, head as 3 ellipses
  parts.push(`<ellipse cx="${cx - s * 0.35}" cy="${cy}" rx="${s * 0.48}" ry="${s * 0.36}"/>`);
  parts.push(`<ellipse cx="${cx + s * 0.2}" cy="${cy}" rx="${s * 0.28}" ry="${s * 0.24}"/>`);
  parts.push(`<ellipse cx="${cx + s * 0.58}" cy="${cy}" rx="${s * 0.22}" ry="${s * 0.2}"/>`);
  // antennae (curve)
  parts.push(`<path d="M ${cx + s * 0.72} ${cy - s * 0.08} Q ${cx + s * 0.95} ${cy - s * 0.45} ${cx + s * 1.0} ${cy - s * 0.55}" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  parts.push(`<path d="M ${cx + s * 0.72} ${cy + s * 0.08} Q ${cx + s * 0.95} ${cy + s * 0.45} ${cx + s * 1.0} ${cy + s * 0.55}" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
  // 6 legs (3 per side), mirrors legPairs with bend
  const legPairs = [[-s * 0.2, s * 0.55, 0.3], [s * 0.1, s * 0.58, 0], [s * 0.35, s * 0.52, -0.3]];
  for (const [lx, reach, bend] of legPairs) {
    const ex = cx + lx + reach * Math.sin(bend);
    parts.push(`<line x1="${cx + lx}" y1="${cy - s * 0.2}" x2="${ex}" y2="${cy - reach}" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`);
    parts.push(`<line x1="${cx + lx}" y1="${cy + s * 0.2}" x2="${ex}" y2="${cy + reach}" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`);
  }
  return parts.join("");
}

// Goal marker: pulsing ring + center dot, drawn in ink (no green).
function goalSvg(cx, cy) {
  const r = TILE * 0.34;
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="2 2"/>
    <circle cx="${cx}" cy="${cy}" r="${TILE * 0.16}" fill="${INK}"/>
  `;
}

// Faint ant trail (simulates renderer.drawTrail) — 4 dots back-tracking left.
const trailDots = [];
for (let i = 1; i <= 4; i++) {
  const tx = antX - i * TILE * 0.55;
  const r = TILE * 0.07 * (1 - i / 5);
  const op = (1 - i / 5) * 0.55;
  trailDots.push(`<circle cx="${tx}" cy="${antY}" r="${r}" fill="${INK}" opacity="${op.toFixed(2)}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- maze area background (paper) -->
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <!-- subtle screentone outside the maze frame -->
  <defs>
    <pattern id="dots" patternUnits="userSpaceOnUse" width="6" height="6">
      <circle cx="3" cy="3" r="0.6" fill="${INK}" fill-opacity="0.18"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- HUD bar (top): black with cream text, mirrors hud.ts -->
  <rect x="0" y="0" width="${W}" height="${HUD_H}" fill="${INK}"/>
  <g font-family="JetBrains Mono, ui-monospace, monospace" font-size="13" font-weight="700" fill="${PAPER}">
    <text x="14" y="${HUD_H * 0.68}" text-anchor="start">Level 3</text>
    <text x="${W / 2}" y="${HUD_H * 0.68}" text-anchor="middle">0:12.4</text>
    <text x="${W - 14}" y="${HUD_H * 0.68}" text-anchor="end">Score: 2850</text>
  </g>

  <!-- maze panel: white path tiles framed by ink walls -->
  <rect x="${OFFSET_X - 2}" y="${OFFSET_Y - 2}" width="${MAZE_W + 4}" height="${MAZE_H + 4}" fill="${PATH}" stroke="${INK}" stroke-width="1"/>

  <!-- start cell highlight (subtle) -->
  <rect x="${OFFSET_X}" y="${OFFSET_Y}" width="${TILE}" height="${TILE}" fill="${INK}" fill-opacity="0.06"/>

  <!-- goal marker -->
  ${goalSvg(goalX, goalY)}

  <!-- walls -->
  <g stroke="${INK}" stroke-width="${WALL_THICKNESS}" stroke-linecap="round" fill="none">
    ${wallLines.join("\n    ")}
  </g>

  <!-- ant trail -->
  ${trailDots.join("\n  ")}

  <!-- ant -->
  <g fill="${INK}">
    ${antSvg(antX, antY)}
  </g>

  <!-- "CLEAN RUN" streak banner at bottom -->
  <g font-family="JetBrains Mono, ui-monospace, monospace" font-size="12" font-weight="700" fill="${INK}" text-anchor="middle">
    <text x="${W / 2}" y="${H - 8}">★ CLEAN RUN</text>
  </g>
</svg>`;

const outPath = "public/projects/antmaze-bw.webp";
const buf = await sharp(Buffer.from(svg))
  .webp({ quality: 90, effort: 5 })
  .toBuffer();
await writeFile(outPath, buf);

console.log(`wrote ${outPath} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
