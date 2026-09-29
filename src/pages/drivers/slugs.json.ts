import type { APIRoute } from 'astro';
import { fetchDriverIndex } from '../../utils/drivers';

/**
 * driverId -> page slug, as a static file (dist/drivers/slugs.json).
 *
 * The calculator's standings and the track grids are client-rendered React and
 * only know driver ids. Slugs are not derivable from an id (namesakes get a year
 * suffix), so they fetch this map once — see hooks/useDriverHref.ts. Built from
 * the same index as the pages themselves, so every entry has a page.
 */
export const GET: APIRoute = async () => {
  const drivers = await fetchDriverIndex();
  const map = Object.fromEntries(drivers.map((d) => [d.driverId, d.slug]));
  return new Response(JSON.stringify(map), { headers: { 'Content-Type': 'application/json' } });
};
