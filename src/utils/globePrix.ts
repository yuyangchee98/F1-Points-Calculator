/**
 * Links from the calculator to Globe Prix (globeprix.chyuang.com), a racing
 * game with one track per country.
 *
 * Globe Prix's tracks are its own designs, one per country, not copies of the
 * real circuits. So every link and every line of copy names the COUNTRY
 * ("Race Brazil"), never the venue ("race Interlagos").
 *
 * Every URL carries ?ref=f1calc, and the links use rel="noopener" without
 * noreferrer, so the visits are attributed to the calculator rather than
 * showing up in Globe Prix's stats as direct traffic.
 */

export const GLOBE_PRIX_ORIGIN = 'https://globeprix.chyuang.com';
export const GLOBE_PRIX_REF = 'f1calc';
export const GLOBE_PRIX_HOME = `${GLOBE_PRIX_ORIGIN}/?ref=${GLOBE_PRIX_REF}`;

export interface GlobePrixCountry {
  /** Directory name under Globe Prix's /circuits/, e.g. "united-states". */
  slug: string;
  /** How the country reads in a sentence: "Race the United States". */
  name: string;
}

/**
 * Calculator country (as the API spells it, lowercased) → Globe Prix circuit.
 *
 * Keys cover every country in /api/circuits (all seasons back to 1958) plus the
 * aliases COUNTRY_CODE_MAP already accepts. Every slug must be a directory in
 * globeprix's public/circuits/; a country missing here falls back to the
 * Globe Prix home page. Las Vegas, Miami and Austin all have country "USA".
 */
const COUNTRIES: Record<string, GlobePrixCountry> = {
  argentina: { slug: 'argentina', name: 'Argentina' },
  australia: { slug: 'australia', name: 'Australia' },
  austria: { slug: 'austria', name: 'Austria' },
  azerbaijan: { slug: 'azerbaijan', name: 'Azerbaijan' },
  bahrain: { slug: 'bahrain', name: 'Bahrain' },
  belgium: { slug: 'belgium', name: 'Belgium' },
  brazil: { slug: 'brazil', name: 'Brazil' },
  canada: { slug: 'canada', name: 'Canada' },
  china: { slug: 'china', name: 'China' },
  france: { slug: 'france', name: 'France' },
  germany: { slug: 'germany', name: 'Germany' },
  hungary: { slug: 'hungary', name: 'Hungary' },
  india: { slug: 'india', name: 'India' },
  italy: { slug: 'italy', name: 'Italy' },
  japan: { slug: 'japan', name: 'Japan' },
  korea: { slug: 'south-korea', name: 'South Korea' },
  'south korea': { slug: 'south-korea', name: 'South Korea' },
  malaysia: { slug: 'malaysia', name: 'Malaysia' },
  mexico: { slug: 'mexico', name: 'Mexico' },
  monaco: { slug: 'monaco', name: 'Monaco' },
  morocco: { slug: 'morocco', name: 'Morocco' },
  netherlands: { slug: 'netherlands', name: 'the Netherlands' },
  portugal: { slug: 'portugal', name: 'Portugal' },
  qatar: { slug: 'qatar', name: 'Qatar' },
  russia: { slug: 'russia', name: 'Russia' },
  'saudi arabia': { slug: 'saudi-arabia', name: 'Saudi Arabia' },
  singapore: { slug: 'singapore', name: 'Singapore' },
  'south africa': { slug: 'south-africa', name: 'South Africa' },
  spain: { slug: 'spain', name: 'Spain' },
  sweden: { slug: 'sweden', name: 'Sweden' },
  switzerland: { slug: 'switzerland', name: 'Switzerland' },
  turkey: { slug: 'turkiye', name: 'Türkiye' },
  uae: { slug: 'united-arab-emirates', name: 'the United Arab Emirates' },
  'united arab emirates': { slug: 'united-arab-emirates', name: 'the United Arab Emirates' },
  uk: { slug: 'united-kingdom', name: 'the United Kingdom' },
  'great britain': { slug: 'united-kingdom', name: 'the United Kingdom' },
  usa: { slug: 'united-states', name: 'the United States' },
  'united states': { slug: 'united-states', name: 'the United States' },
  'las vegas': { slug: 'united-states', name: 'the United States' },
};

/** Every slug this file links to, for the test that checks them. */
export const GLOBE_PRIX_SLUGS = [...new Set(Object.values(COUNTRIES).map((c) => c.slug))];

/** The Globe Prix circuit for a calculator country, or null when it has none. */
export function globePrixCountry(country: string | undefined | null): GlobePrixCountry | null {
  if (!country) return null;
  return COUNTRIES[country.trim().toLowerCase()] ?? null;
}

/** The country's circuit page, or the Globe Prix home page when there is none. */
export function globePrixHref(country: string | undefined | null): string {
  const c = globePrixCountry(country);
  return c ? `${GLOBE_PRIX_ORIGIN}/circuits/${c.slug}?ref=${GLOBE_PRIX_REF}` : GLOBE_PRIX_HOME;
}

/**
 * The first race on the calendar that has not started yet, or null once the
 * last one has. Undated races are skipped; order breaks ties so a sprint and
 * its Grand Prix resolve to the earlier session (same country either way).
 */
export function nextRace<T extends { date?: string; order: number }>(
  races: readonly T[],
  now: number = Date.now(),
): T | null {
  let best: T | null = null;
  let bestTime = Infinity;
  for (const race of races) {
    if (!race.date) continue;
    const t = Date.parse(race.date);
    if (Number.isNaN(t) || t <= now) continue;
    if (t < bestTime || (t === bestTime && best && race.order < best.order)) {
      best = race;
      bestTime = t;
    }
  }
  return best;
}
