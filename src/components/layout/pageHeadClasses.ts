/**
 * The page head — the row between the section bar and the content: an eyebrow,
 * the page's one h1, and at most one primary action on the right.
 *
 * Class strings rather than one component for the same reason as
 * components/nav/sectionBar.ts: Tracks renders it from Astro (PageHead.astro),
 * Compete from React (PageHead.tsx), and sharing the strings is what keeps the
 * two identical. Keep each value a single whole class-name string so Tailwind's
 * scanner can see it.
 */

export const PAGE_HEAD_CLASS =
  'flex flex-wrap items-center gap-x-4 gap-y-3 pb-4 mb-5 border-b';

export const PAGE_HEAD_EYEBROW_CLASS =
  'text-2xs font-bold uppercase tracking-wider text-ink-muted';

export const PAGE_HEAD_TITLE_CLASS =
  'text-xl font-display font-bold tracking-tight text-ink leading-tight text-balance';

export const PAGE_HEAD_ACTIONS_CLASS =
  'ml-auto flex flex-wrap items-center gap-3';

/** The uppercase label above a block of content ("Drivers", "Scored races"). */
export const SECTION_LABEL_CLASS =
  'flex items-baseline justify-between gap-3 mb-2 text-2xs font-bold uppercase tracking-wider text-ink-muted';

export const SECTION_LABEL_HINT_CLASS =
  'font-medium normal-case tracking-normal text-ink-muted';
