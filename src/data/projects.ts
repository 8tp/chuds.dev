export type Project = {
  /** Stable slug, also used for thumbnail filename: `/projects/<slug>.webp` */
  slug: string;
  name: string;
  year: number;
  /** Short, single-sentence description shown on the card. */
  description: string;
  /** Subtle accent color for the card (Catppuccin token name). */
  accent:
    | "peach"
    | "mauve"
    | "blue"
    | "green"
    | "teal"
    | "sapphire"
    | "yellow"
    | "red"
    | "rosewater"
    | "lavender";
  source?: string;
  website?: string;
  /** Tech stack pills — keep to 3-4 max for visual balance. */
  stack: string[];
  /** Marks the project as "live" — shown with a pulsing dot. */
  live?: boolean;
  /** Show prominently in the featured row at the top of the grid. */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "antmaze",
    name: "AntMaze",
    year: 2026,
    description:
      "Perpetual-motion maze game where the ant never stops moving. Procedurally generated 7×7 → 21×21 mazes, LBP-inspired Web Audio soundtrack, ~10 KB gzipped.",
    accent: "yellow",
    source: "https://github.com/8tp/AntMaze",
    website: "https://ant.chuds.dev",
    stack: ["TypeScript", "Vite", "Canvas 2D", "Web Audio"],
    live: true,
    featured: true,
  },
  {
    slug: "hudaim",
    name: "HudAim",
    year: 2025,
    description:
      "Browser-based aim trainer with 6 game modes, 60 FPS replay system, LAN leaderboards and HMAC-SHA256 anti-cheat.",
    accent: "sapphire",
    source: "https://github.com/8tp/hudaim",
    website: "https://aim.chuds.dev",
    stack: ["React 19", "Tailwind", "Node/Express", "IndexedDB"],
    live: true,
    featured: true,
  },
  {
    slug: "coup",
    name: "Coup",
    year: 2025,
    description:
      "Real-time multiplayer bluffing card game. Bots, room codes, mobile-friendly. No install, no accounts.",
    accent: "green",
    source: "https://github.com/8tp/Coup",
    website: "https://coup.chuds.dev",
    stack: ["Next.js", "TypeScript", "Socket.io", "Zustand"],
    live: true,
    featured: true,
  },
  {
    slug: "typeduel",
    name: "TypeDuel",
    year: 2025,
    description:
      "Real-time multiplayer typing combat. Type fast, deal damage, use abilities, defeat your opponent.",
    accent: "red",
    source: "https://github.com/8tp/typeduel",
    website: "https://duel.chuds.dev",
    stack: ["TypeScript", "React", "WebSocket", "Zustand"],
    live: true,
  },
  {
    slug: "tidewatcher",
    name: "TideWatcher",
    year: 2025,
    description:
      "System monitor TUI with tide-inspired live charts, process views, and theme-aware ASCII scenes.",
    accent: "peach",
    source: "https://github.com/8tp/tidewatcher",
    stack: ["Rust", "Ratatui"],
  },
  {
    slug: "ghgarden",
    name: "ghgarden",
    year: 2025,
    description:
      "GitHub contribution visualizer in the terminal — heatmaps, streak stats, language breakdowns, 6 themes.",
    accent: "green",
    source: "https://github.com/8tp/ghgarden",
    stack: ["Rust", "Ratatui"],
  },
  {
    slug: "netmap",
    name: "netmap",
    year: 2025,
    description:
      "Visual network topology mapper and scanner — discover devices, scan ports, measure latency.",
    accent: "blue",
    source: "https://github.com/8tp/netmap",
    stack: ["Go", "Bubble Tea"],
  },
  {
    slug: "litestats",
    name: "LiteStats",
    year: 2025,
    description:
      "Lightweight macOS menu bar app for real-time CPU, RAM, storage, battery, and temperature.",
    accent: "mauve",
    source: "https://github.com/8tp/LiteStats",
    stack: ["Swift", "SwiftUI", "IOKit"],
  },
  {
    slug: "screencap",
    name: "ScreenCap",
    year: 2025,
    description:
      "Native macOS screenshot & annotation app. Area / window / scrolling capture, screen recording, OCR, GIF export.",
    accent: "sapphire",
    source: "https://github.com/8tp/ScreenCap",
    stack: ["Swift", "SwiftUI", "Vision"],
  },
  {
    slug: "recopy",
    name: "Recopy",
    year: 2025,
    description:
      "Native macOS menu bar clipboard manager. Zero dependencies, fully offline, built with SwiftData.",
    accent: "yellow",
    source: "https://github.com/8tp/Recopy",
    stack: ["Swift", "SwiftUI", "SwiftData"],
  },
];

export const featured = projects.filter((p) => p.featured);
export const rest = projects.filter((p) => !p.featured);
