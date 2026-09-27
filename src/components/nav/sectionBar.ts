/**
 * Tier 2 of the site chrome — the section bar.
 *
 * Sits directly under the spine and carries only the current section's controls:
 * season + points system for the calculator, tabs for Compete, the circuit
 * picker for Tracks. Anything that navigates between sections belongs in the
 * spine instead (components/nav/SiteSpine.astro).
 *
 * The classes live here as plain strings rather than in a component because the
 * bar is Astro on Tracks (static, crawlable) and React on Calculator and Compete
 * (needs Redux and tab state). Sharing the strings is what keeps the three
 * looking like one bar. Same trick as buttonClasses() in components/ui/Button.tsx.
 *
 * Keep each value a single whole class-name string — Tailwind's scanner reads
 * these files (tailwind.config.js content globs src/**\/*.ts) but cannot resolve
 * classes assembled from fragments at runtime.
 */

export const SECTION_BAR_CLASS =
  'flex items-center gap-1.5 sm:gap-2 flex-wrap px-2 sm:px-4 py-1.5 min-h-[46px] bg-surface-sunken border-b shrink-0';

export const SECTION_BAR_TITLE_CLASS =
  'text-sm font-display font-bold text-ink mr-1.5 truncate';

/**
 * A section bar whose contents line up with PAGE_CONTAINER_CLASS below it. Same
 * as SECTION_BAR_CLASS minus the horizontal padding: the bar stays full-bleed
 * (background and border edge to edge) and SECTION_BAR_INNER_CLASS carries the
 * page's own max-width and padding, so the bar's title and the page's first
 * column share one left edge at every width.
 */
export const SECTION_BAR_CONTAINED_CLASS =
  'flex items-center py-1.5 min-h-[46px] bg-surface-sunken border-b shrink-0';

export const SECTION_BAR_INNER_CLASS =
  'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 flex-wrap';

/** The bar's right-hand slot: season, counts, the Compete lock countdown. */
export const SECTION_BAR_STATUS_CLASS =
  'ml-auto flex items-center gap-2 text-xs text-ink-muted';

/**
 * The content container for sections that scroll as a document (Compete, the
 * Tracks index). The calculator and a single track page are full-height tools
 * and do not use it.
 */
export const PAGE_CONTAINER_CLASS =
  'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5';
