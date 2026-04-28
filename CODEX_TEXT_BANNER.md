# Codex prompt — aesthetic text banner for chuds.dev

Hand this to codex (or any agent with access to OpenAI's image API) if you
ever decide you want a stylized **text-only** banner image to drop in above
the current HTML wordmark. It's optional — the site looks fine with just the
HTML banner — but this gives you the trafficlunar-style "rendered as art"
text treatment.

> Output: a single image at `public/banner.webp`, 1280×320, ≤30 KB. The
> existing `<Banner.astro>` already references this path; if the file is
> missing the HTML wordmark renders instead, so you can swap it in
> non-destructively.

## The prompt

```
A wide horizontal banner, 4:1 aspect ratio (1280×320). Pure typography
art — no UI chrome, no traffic lights, no decorative scenes, no humans.

Background: solid #1a1b26 (Tokyo Night base) with a single very faint
diagonal grain texture, almost imperceptible.

Centered, occupying ~60% of the canvas width: the wordmark "chuds.dev"
rendered as a custom display-monospace style. The "chuds" portion is in
#c0caf5 off-white with a slight inner highlight on the top edge of each
letter (as if lit from above). The "." is a 12px filled square in
#9ece6a green, set inline with the text — like a unix prompt cursor
that decided to live mid-word. The ".dev" portion is in #bb9af7 magenta
with a 1px inner shadow giving it a slight pressed-in look.

The font feel: chunky geometric monospace, thick weight (around 800),
generous letter-spacing (around 0.04em), all lowercase. Think of a hand-
crafted ligature-rich coding font like Berkeley Mono or PragmataPro
displayed at marquee size — confident, not cute.

Below the wordmark, in a smaller weight-400 monospace with the same
letter-spacing, a single line:
  $ premium software · engineered from the basement
"$" in #9ece6a green. The rest in #737aa2 muted lavender.

Optional: in the bottom-right corner, a tiny 8px dotted line drawing
of a half-moon and a few stars in #565f89 — a subtle nod to "tokyo
night" without spelling it out.

Absolutely no photorealism, no glow halos, no synthwave neon, no
gradient skies. The whole banner reads as flat, deliberate, terminal-
adjacent typography. If a designer made this in Figma, every element
would be vector. Sharp, legible, no anti-aliasing artifacts on text.
4:1 banner. Output 1024×1024, then center-crop to 1024×256, resize to
1280×320, encode webp quality 85.
```

## Implementation snippet

```python
from openai import OpenAI
import base64, pathlib, subprocess

client = OpenAI()

resp = client.images.generate(
    model="gpt-image-1",          # or gpt-image-2 if it's out
    prompt=PROMPT,                # the block above
    size="1024x1024",
    quality="high",
    n=1,
)

png = pathlib.Path("/tmp/banner.png")
png.write_bytes(base64.b64decode(resp.data[0].b64_json))

subprocess.check_call([
    "magick", str(png),
    "-gravity", "center",
    "-crop", "1024x256+0+0", "+repage",
    "-resize", "1280x320",
    "-quality", "85",
    "-define", "webp:method=6",
    "public/banner.webp",
])
```

## After it lands

Restore the image-based banner by editing `src/components/Banner.astro`:
swap the HTML `<h1>` block for an `<img src="/banner.webp">`. The previous
version of that file (in git history under the polish-pass commits) has
the markup ready to copy back.

If you don't like the result, regenerate. The HTML wordmark is the safe
default — the site doesn't depend on this image existing.
