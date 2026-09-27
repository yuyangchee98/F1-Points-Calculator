/** Display helpers shared by Compete's panels. */

/** 'azerbaijan-grand-prix' → 'Azerbaijan Grand Prix'. */
export const formatRaceName = (name: string): string =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * The page-head title. Schedule names drop "Grand Prix" ('Azerbaijan',
 * 'Azerbaijan Sprint'), which reads fine in a grid column header but thin as a
 * page's h1 — so a Grand Prix gets it back and a sprint keeps its own suffix.
 */
export const raceTitle = (race: { name: string; isSprint: boolean }): string =>
  race.isSprint ? formatRaceName(race.name) : `${formatRaceName(race.name)} Grand Prix`;

export const getDriverCode = (driver: { code?: string; familyName: string } | undefined): string => {
  if (!driver) return '---';
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
};

export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
