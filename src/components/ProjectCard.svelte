<script lang="ts">
  import { ACCENT_HEX, type Project } from "~/data/projects";

  interface Props {
    project: Project;
  }

  let { project }: Props = $props();

  // Used for the yabai-stripe + dot color. Reads the same hex map the codex
  // prompt cites, so the generated image and the surrounding chrome match.
  const accent = ACCENT_HEX[project.accent];
  const thumbSrc = `/projects/${project.slug}.webp`;
  const isSpotlight = $derived(!!project.spotlight);
</script>

<article
  class="win tile flex {isSpotlight
    ? 'lg:flex-row lg:[&>.thumb]:w-[58%] lg:[&>.body]:w-[42%]'
    : 'flex-col'}"
  style="--win-accent: {accent}"
>
  <!-- Title bar — fake kitty-window chrome -->
  <div class="win-title">
    <span class="win-dots"><span></span><span></span><span></span></span>
    <span class="truncate">
      {project.website
        ? project.website.replace(/^https?:\/\//, "")
        : `~/${project.slug}`}
    </span>
    <span class="ml-auto flex items-center gap-1.5 text-[10px]">
      {#if project.live}
        <span class="size-1.5 rounded-full animate-pulse" style="background: {accent}"></span>
        <span style="color: {accent}">LIVE</span>
      {:else}
        <span class="text-comment">{project.year}</span>
      {/if}
    </span>
  </div>

  <!-- Thumbnail body -->
  <div
    class="thumb relative aspect-[16/10] overflow-hidden bg-bg-dark shrink-0 {isSpotlight
      ? 'lg:aspect-auto lg:self-stretch lg:border-r lg:border-border'
      : ''}"
  >
    <img
      src={thumbSrc}
      alt="{project.name} preview"
      loading="lazy"
      decoding="async"
      class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      onerror={(e: Event) => {
        const img = e.currentTarget as HTMLImageElement;
        img.style.display = "none";
        img.parentElement?.classList.add("placeholder");
      }}
    />
    <!-- Bottom vignette — keeps the page legible even with bright thumbnails -->
    <div
      class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-panel via-panel/40 to-transparent {isSpotlight
        ? 'lg:hidden'
        : ''}"
    ></div>
  </div>

  <!-- Body -->
  <div
    class="body px-4 py-3.5 flex flex-col gap-2.5 flex-1 {isSpotlight
      ? 'lg:p-6 lg:gap-3.5 lg:justify-center'
      : ''}"
  >
    <div class="flex items-center gap-2">
      <span class="size-2 rounded-full" style="background: {accent}"></span>
      <h3
        class="font-display font-semibold text-fg leading-tight {isSpotlight
          ? 'text-xl lg:text-2xl'
          : 'text-base'}"
      >
        {project.name}
      </h3>
      {#if !project.live}
        <span class="ml-auto font-mono text-[10px] text-comment">{project.year}</span>
      {/if}
      {#if isSpotlight}
        <span
          class="ml-auto px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border"
          style="color: {accent}; border-color: {accent}66; background: {accent}11;"
        >
          spotlight
        </span>
      {/if}
    </div>

    <p
      class="text-fg-dim leading-relaxed {isSpotlight
        ? 'text-sm lg:text-[0.95rem]'
        : 'text-[13px]'}"
    >
      {project.description}
    </p>

    <div class="flex flex-wrap gap-1 pt-0.5">
      {#each project.stack as tech}
        <span class="pill">{tech}</span>
      {/each}
    </div>

    <div class="flex items-center gap-3 pt-1.5 mt-auto text-xs font-mono">
      {#if project.website}
        <a
          href={project.website}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style="color: {accent}"
        >
          <span>→</span>
          {project.website.replace(/^https?:\/\//, "")}
        </a>
      {/if}
      {#if project.source}
        <a
          href={project.source}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg transition-colors"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          source
        </a>
      {/if}
    </div>
  </div>
</article>

<style>
  /* Diagonal-stripe placeholder for missing thumbnails — Tokyo Night flavored. */
  :global(.placeholder) {
    background:
      repeating-linear-gradient(
        135deg,
        var(--color-bg-dark) 0 12px,
        var(--color-elev) 12px 14px
      );
  }
</style>
