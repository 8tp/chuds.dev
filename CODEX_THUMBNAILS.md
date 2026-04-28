# Codex prompt — generate project thumbnails with `gpt-image-1`

Hand this entire file to **codex** (or any agent with shell + OpenAI image-gen access).
The agent is expected to call OpenAI's image API for each project, save the result
as a `.webp` in `public/projects/`, and verify the filename matches the slug
referenced in `src/data/projects.ts`.

> Note: as of writing the model id is `gpt-image-1` (OpenAI's flagship image
> model). If `gpt-image-2` is available by the time you run this, swap the
> id — the API surface is identical.

---

## Goal

For each project in `src/data/projects.ts`, generate one **512 × 320** thumbnail
that looks like a clean screenshot of that app's actual UI (or, for terminal /
TUI projects, a stylised terminal view). The thumbnails should feel **cohesive
as a set** — same lighting, same vibe, same color discipline — while still
showing a recognisable hint of each app.

This is the same visual approach `trafficlunar.net` uses: tiny app screenshots
with the project's name visible inside the artwork.

## Hard constraints (apply to every image)

- **Output size:** `1024x1024` from the API, then downscale to **512×320** webp
  with `sharp` or `cwebp` (quality 85). Keep the aspect ratio exactly 16:10 —
  crop from the center.
- **Theme:** Catppuccin Frappé. Allowed UI colors:
  - background: `#303446` (base) and `#292c3c` (mantle)
  - panels: `#414559` (surface0) on `#303446`
  - text: `#c6d0f5` (text), `#a5adce` (muted)
  - accents only — pick exactly **one** per project from this list and use it
    for the project's primary color: peach `#ef9f76`, mauve `#ca9ee6`, blue
    `#8caaee`, green `#a6d189`, teal `#81c8be`, sapphire `#85c1dc`, yellow
    `#e5c890`, red `#e78284`, lavender `#babbf1`, rosewater `#f2d5cf`.
  - the per-project accent **must match** the `accent` field already set in
    `src/data/projects.ts` — read that file first, do not re-pick.
- **Style:** flat, modern UI. Crisp 1px borders, soft shadows, generous padding,
  rounded corners (8–12px). No skeuomorphism, no glassmorphism overload, no
  drop shadows on text. Think Linear / Raycast / Arc, not Material Design.
- **Typography inside the image:** sans-serif (Inter / SF Pro feel) for UI
  text; monospace (JetBrains Mono feel) only for code, terminal, or numeric
  HUDs. Real, legible English — never lorem ipsum, never garbled letters.
- **Composition:** the project's wordmark or app icon must appear somewhere
  visible (top-left chrome, window title bar, or large heading). Treat each
  thumbnail as if it were a real product hero shot.
- **Forbidden:** no human faces, no fake brand logos (GitHub octocat ok), no
  watermarks, no AI-art signatures, no pixelation artifacts, no blurry text.
- **Negative space:** leave room — every thumbnail will have a dark
  `from-mantle/95 → transparent` gradient overlaid on the bottom 50% by the
  site, so important content should sit in the **top half**.

## Per-project prompts

Use these as the `prompt` field for the image API. The **slug** is the output
filename (`public/projects/<slug>.webp`).

### `antmaze.webp` — accent: yellow `#e5c890`
```
A minimal browser game UI screenshot in Catppuccin Frappé colors. Centered:
a small grid maze (around 11x11 cells) drawn with thin warm-yellow lines
(#e5c890) on a dark navy background (#303446). A glowing yellow ant token
sits on one cell, with a faint yellow trail behind it. Top-left HUD chip
labeled "AntMaze" in white sans-serif. Top-right shows "LV 5  ·  15x15".
Bottom shows three small stat pills: "SCORE 1840", "STREAK 1.5x", "0:47".
Flat modern game UI, no illustrations, no characters. 16:10.
```

### `hudaim.webp` — accent: sapphire `#85c1dc`
```
First-person aim trainer UI in Catppuccin Frappé. Dark navy backdrop
(#303446) with a 3D-style flat-shaded arena hinted at the center. Three
glowing sapphire-blue (#85c1dc) circular targets float in the foreground.
Crosshair in the exact center. Bottom HUD bar shows: "ACCURACY 87%",
"TTK 412ms", "STREAK 14". Top-left wordmark "HudAim" in white sans. No
weapons, no characters, no realistic 3D. Flat low-poly aesthetic, soft
glow on targets only. 16:10.
```

### `coup.webp` — accent: green `#a6d189`
```
Top-down view of a multiplayer card game UI in Catppuccin Frappé. Three
flat illustrated cards fanned in the foreground (back-of-card design only,
soft green #a6d189 medallion pattern, no characters). A round green
"CHALLENGE" button glows on the right. Top of screen shows player chips
"alex · 2 coins" and "you · 7 coins" with small avatar circles. Title
"COUP" top-left in soft serif. Dark navy background. No table felt
texture, no realism. Clean modern board-game-app look. 16:10.
```

### `typeduel.webp` — accent: red `#e78284`
```
Split-screen multiplayer typing UI in Catppuccin Frappé. Left half shows
a paragraph of monospace text with the first ~40 characters highlighted
red (#e78284) as if typed; a cursor block sits on the next character.
Right half shows opponent's progress bar at ~60% with a matching red
fill. Top center: "TypeDuel" wordmark + a heart-meter HUD ("YOU 84 HP
/ THEM 32 HP"). No avatars, no faces. Sharp monospace text, dark navy
backdrop. 16:10.
```

### `tidewatcher.webp` — accent: peach `#ef9f76`
```
A terminal TUI screenshot of a system monitor in Catppuccin Frappé. Black
terminal window with rounded corners and a peach (#ef9f76) accent. Inside
the terminal: a CPU usage line chart that looks like an ocean tide wave
(peach line on dark bg), a process table below ("PID  CMD  CPU%  MEM"),
and a small ASCII art scene of waves at the bottom right. Window title
bar reads "tidewatcher". JetBrains Mono / Fira Code typography. No
external chrome, no desktop wallpaper. 16:10.
```

### `ghgarden.webp` — accent: green `#a6d189`
```
Terminal TUI showing a GitHub contribution heatmap in Catppuccin Frappé,
green (#a6d189) palette. The heatmap fills the top half — a 7x52 grid
of squares in five shades of green from dark to bright. Below the heatmap:
"Streak: 47 days" and a small horizontal language-breakdown bar (Rust 41%,
TypeScript 28%, Go 18%, etc.) using subtle accent colors. Window title
"ghgarden". Monospace text only. Dark terminal background. 16:10.
```

### `netmap.webp` — accent: blue `#8caaee`
```
Terminal TUI of a network topology map in Catppuccin Frappé. A node
graph rendered with box-drawing characters and ASCII lines connects six
labeled nodes ("router", "nas", "macbook", "phone", "printer", "pi") with
latency values on each edge ("12ms", "3ms", etc.). Blue (#8caaee) accent
for node borders. Bottom status bar: "6 hosts · 23 ports · 2.4ms avg".
Title "netmap". Monospace, dark terminal bg, no extra chrome. 16:10.
```

### `litestats.webp` — accent: mauve `#ca9ee6`
```
A macOS menu-bar app dropdown panel in Catppuccin Frappé. Render only the
dropdown — a rounded floating panel ~300px wide on a transparent dark
background. Inside: four rows showing "CPU 24%", "RAM 8.4 / 16 GB",
"DISK 412 / 1024 GB", "BATT 87%", each with a tiny mauve (#ca9ee6) bar
graph. A small mauve gauge at the top reads "62°C". Mac-style SF Pro
typography. Top-right: a tiny "•" menu bar icon hint. No window chrome,
no desktop. 16:10.
```

### `screencap.webp` — accent: sapphire `#85c1dc`
```
A macOS screen-capture toolbar overlay in Catppuccin Frappé. Centered: a
floating dark capsule with rounded corners showing icons in a row —
rectangle-select, window-select, fullscreen, record, color-picker, OCR
(text icon), GIF — all in sapphire blue (#85c1dc) outline. A faint
dashed sapphire selection rectangle is drawn over a softly-blurred
abstract desktop in the background. Wordmark "ScreenCap" tiny at the
bottom-right. No real desktop content, no human faces. 16:10.
```

### `recopy.webp` — accent: yellow `#e5c890`
```
A macOS clipboard manager dropdown panel in Catppuccin Frappé. Floating
rounded panel ~340px wide, dark navy bg (#303446). Inside: a list of
five clipboard history rows, each with a tiny icon (text, link, image,
code, color swatch), a label ("commit hash a3f9c2…", "https://chuds.dev",
"Screenshot.png", etc.), and a yellow (#e5c890) timestamp ("2m", "1h",
"yesterday"). Top of panel: search field and a small yellow "Recopy"
title. SF Pro typography. No window chrome. 16:10.
```

## Implementation steps for the agent

1. **Read** `src/data/projects.ts` to get the canonical list of `{slug, accent}`
   pairs. If a slug here doesn't match the prompts in this file, **stop** and
   ask the user — don't guess.
2. For each project, call OpenAI's image API. Pseudocode:
   ```python
   from openai import OpenAI
   import base64, pathlib, subprocess

   client = OpenAI()
   for slug, prompt in PROMPTS.items():
       resp = client.images.generate(
           model="gpt-image-1",   # use gpt-image-2 if available
           prompt=prompt,
           size="1024x1024",
           quality="high",
           n=1,
       )
       png_path = pathlib.Path(f"/tmp/{slug}.png")
       png_path.write_bytes(base64.b64decode(resp.data[0].b64_json))

       # Crop to 16:10 (1024 → 1024x640) center-crop, then resize to 512x320,
       # then encode as webp.
       out = pathlib.Path(f"public/projects/{slug}.webp")
       out.parent.mkdir(parents=True, exist_ok=True)
       subprocess.check_call([
           "magick", str(png_path),
           "-gravity", "center",
           "-crop", "1024x640+0+0", "+repage",
           "-resize", "512x320",
           "-quality", "85",
           "-define", "webp:method=6",
           str(out),
       ])
   ```
   If `magick` isn't available, fall back to `ffmpeg` or `sharp` — any tool
   that produces a 512×320 webp at quality 85 is fine.
3. **Verify:** after writing all files, run `pnpm build` and confirm there are
   no broken-image warnings. The fallback diagonal-stripe placeholder in
   `ProjectCard.svelte` should no longer appear.
4. **Commit** the new images on the current branch (`astro-redesign`) in a
   single commit titled `Add generated project thumbnails`. Do not commit the
   intermediate PNGs.

## Sanity rules

- If a generated image has unreadable text, regenerate that one project (max
  3 retries). Do **not** ship gibberish typography.
- If the API returns a content-policy refusal on any prompt, soften the
  language (e.g. "duel" → "match", "weapon" → "tool") and retry once.
- Estimated cost: ~10 images × `gpt-image-1 high` ≈ $0.40–$0.80 total.
  Confirm with the user before regenerating in bulk if the first batch is
  unsatisfactory.
