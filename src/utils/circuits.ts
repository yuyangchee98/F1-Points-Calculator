import { COUNTRY_CODE_MAP } from './constants';
import type { CircuitListItem } from '../types/track';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

/**
 * The circuit list, at build time.
 *
 * Both /tracks and /tracks/[track] need it, and both must fail the build the
 * same way if it is missing: a partial list would 404 every track link in the
 * calculator, and an empty one would ship a Tracks section with nothing in it.
 * Keeping one copy means that contract cannot drift between the two pages.
 */
export async function fetchCircuitList(): Promise<CircuitListItem[]> {
  let circuits: CircuitListItem[];

  try {
    const res = await fetch(`${API_BASE_URL}/api/circuits`);
    if (!res.ok) {
      throw new Error(`/api/circuits returned HTTP ${res.status}`);
    }
    const data = (await res.json()) as { circuits?: CircuitListItem[] };
    circuits = data.circuits ?? [];
  } catch (err) {
    throw new Error(
      `[tracks] Cannot build track pages: failed to load the circuit list from the Worker ` +
        `(${API_BASE_URL}/api/circuits). ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (circuits.length === 0) {
    throw new Error(
      `[tracks] Cannot build track pages: /api/circuits returned an empty list. ` +
        `Refusing to ship a track-page-less build.`,
    );
  }

  return circuits;
}

/**
 * The local flag asset for a country, as `/flags/<code>.webp`.
 *
 * Returns '' for a country with no flag on disk, which every caller renders as
 * "no flag" rather than a broken image.
 *
 * The Tracks section used to point these at flagcdn.com — 31 requests to a
 * third party on the index alone, on the most crawlable pages the site has, for
 * images the calculator was already serving locally. public/flags/ is the same
 * asset set the race grid uses, so the codes here are the map's own (the UK is
 * 'uk', not flagcdn's 'gb') and no translation is needed any more.
 */
export function flagCodeFor(country: string): string {
  return COUNTRY_CODE_MAP[country.toLowerCase()] ?? '';
}

/** Source for a country's flag, or '' when there is no asset for it. */
export function flagSrcFor(country: string): string {
  const code = flagCodeFor(country);
  return code ? `/flags/${code}.webp` : '';
}

/**
 * The venue's own name, e.g. "Circuit de Spa-Francorchamps".
 *
 * The API supplies this directly now. It used to be reverse-engineered from the
 * part of the slug the race name did not account for, which was a workaround for
 * not having the venue at all — and it silently returned '' as soon as the race
 * name itself began carrying a venue qualifier.
 */
export function circuitVenue(circuit: CircuitListItem): string {
  return circuit.circuitName;
}

/**
 * Drop the venue qualifier the API appends to keep page titles unique, leaving the
 * plain race name. The qualifier belongs in a <title>, where two pages must be
 * told apart, but not in prose — "Every French Grand Prix (Reims-Gueux) winner at
 * Reims-Gueux" says it twice — and not in the comparison that decides whether an
 * edition ran under a FORMER name, which would otherwise treat every edition of a
 * qualified circuit as a rename.
 */
export function stripVenueQualifier(fullName: string): string {
  return fullName.replace(/\s*\([^)]*\)$/, '');
}

/** The race name for a listed circuit, without the venue qualifier. */
export function circuitRaceName(circuit: CircuitListItem): string {
  return stripVenueQualifier(circuit.fullName);
}

/** Countries A–Z, circuits A–Z within each. Used by the index and the picker. */
export function groupByCountry(
  circuits: CircuitListItem[],
): { country: string; circuits: CircuitListItem[] }[] {
  const byCountry = new Map<string, CircuitListItem[]>();

  for (const circuit of circuits) {
    const list = byCountry.get(circuit.country);
    if (list) list.push(circuit);
    else byCountry.set(circuit.country, [circuit]);
  }

  return [...byCountry.entries()]
    .map(([country, list]) => ({
      country,
      circuits: [...list].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}
