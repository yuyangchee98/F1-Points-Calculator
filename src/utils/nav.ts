/**
 * The site's top-level sections — the "spine".
 *
 * Every page belongs to exactly one section, and the spine highlights it. The
 * mapping lives here rather than as a prop on each page because there are 44
 * hand-rolled season pages (1981.astro … 2024.astro) plus index.astro and
 * [year].astro, and threading a `section` prop through all of them would mean 46
 * edits every time the nav changes. Deriving it from the pathname means zero.
 *
 * The Worker renders /blog, /leaderboard and /user/* from a separate template
 * pipeline (f1-points-calculator-api/src/lib/). When the spine lands there it
 * needs this same mapping — keep the two copies byte-identical.
 */

export type SectionId = 'calculator' | 'tracks' | 'compete' | 'blog' | 'none';

export interface Section {
  id: Exclude<SectionId, 'none'>;
  label: string;
  href: string;
}

/** Display order in the spine and the mobile tab bar. */
export const SECTIONS: readonly Section[] = [
  { id: 'calculator', label: 'Calculator', href: '/' },
  { id: 'tracks', label: 'Tracks', href: '/tracks' },
  { id: 'compete', label: 'Compete', href: '/compete' },
  { id: 'blog', label: 'Blog', href: '/blog' },
] as const;

/**
 * Which section owns this path.
 *
 * 'none' is a legitimate answer, not a failure: /about, /changelog and the 404
 * page render the spine with nothing highlighted. They are site furniture, not
 * sections, and pretending otherwise would light a nav item the user did not
 * navigate to.
 *
 * /leaderboard and /user/* are Compete surfaces served by the Worker — the
 * standalone leaderboard is the same data as Compete's Leaderboard tab, and a
 * profile is a competitor's record. Both belong under Compete.
 */
export function sectionForPath(pathname: string): SectionId {
  // Normalise away a trailing slash so '/tracks/' and '/tracks' agree. The site
  // is trailingSlash:'never' (astro.config.mjs), but the Worker and hand-typed
  // URLs are not bound by that.
  //
  // Also strip '.html': with build.format 'file', Astro.url.pathname at BUILD
  // time is '/2025.html', '/tracks.html' (only '/' stays bare). Dev serves
  // '/2025', so without this the highlight works in dev and vanishes in prod.
  const path = pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';

  if (path === '/' || /^\/(?:19|20)\d{2}$/.test(path)) return 'calculator';
  if (path === '/tracks' || path.startsWith('/tracks/')) return 'tracks';
  if (path === '/compete' || path === '/leaderboard' || path.startsWith('/user/')) return 'compete';
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog';

  return 'none';
}
