<script lang="ts">
  import type { Project } from "~/data/projects";

  interface Props {
    project: Project;
    /** When true, render the wider featured layout */
    featured?: boolean;
  }

  let { project, featured = false }: Props = $props();

  // Map accent name → CSS variable, used for subtle border + dot color.
  const accentVar = `var(--color-${project.accent})`;

  // Public path; the gpt-image-2 generation step fills these in later.
  const thumbSrc = `/projects/${project.slug}.webp`;
</script>

<article
  class="group relative overflow-hidden rounded-xl border border-surface0/80 bg-mantle/60 backdrop-blur-sm tile flex flex-col"
  class:lg:col-span-2={featured}
  style="--accent: {accentVar}"
>
  <!-- Thumbnail -->
  <div class="relative aspect-[16/10] overflow-hidden bg-crust">
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
    <!-- Vignette gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-mantle/95 via-mantle/30 to-transparent"
    ></div>
    <!-- Year tag -->
    <span
      class="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-crust/80 backdrop-blur-sm text-[11px] font-mono text-overlay1 border border-surface0/60"
    >
      {project.year}
    </span>
    {#if project.live}
      <span
        class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-crust/80 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider border border-surface0/60"
        style="color: {accentVar}"
      >
        <span class="size-1.5 rounded-full animate-pulse" style="background: {accentVar}"></span>
        live
      </span>
    {/if}
  </div>

  <!-- Body -->
  <div class="p-4 flex flex-col flex-1 gap-3">
    <div class="flex items-center gap-2">
      <span class="size-2 rounded-full" style="background: {accentVar}"></span>
      <h3 class="font-display text-lg font-semibold text-text leading-tight">
        {project.name}
      </h3>
    </div>

    <p class="text-sm text-subtext0 leading-relaxed">
      {project.description}
    </p>

    <div class="flex flex-wrap gap-1 mt-auto">
      {#each project.stack as tech}
        <span class="pill text-[10px]!">{tech}</span>
      {/each}
    </div>

    <div class="flex items-center gap-3 pt-1.5 text-xs font-medium">
      {#if project.website}
        <a
          href={project.website}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-text hover:text-peach transition-colors"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
          {project.website.replace(/^https?:\/\//, "")}
        </a>
      {/if}
      {#if project.source}
        <a
          href={project.source}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-overlay1 hover:text-text transition-colors"
        >
          <svg viewBox="0 0 24 24" class="size-3.5" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          source
        </a>
      {/if}
    </div>
  </div>
</article>

<style>
  /* When the thumbnail fails to load, draw a generative diagonal-stripe
     placeholder so the layout stays sturdy until assets are dropped in. */
  :global(.placeholder) {
    background:
      repeating-linear-gradient(
        135deg,
        var(--color-mantle) 0 12px,
        var(--color-surface0) 12px 14px
      );
  }
  :global(.placeholder)::before {
    content: attr(data-slug);
  }
</style>
