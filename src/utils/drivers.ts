import { CURRENT_SEASON } from './constants';
import type { CareerTeam, DriverCareer, DriverListItem } from '../types/driver';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

/**
 * The driver list, at build time.
 *
 * Same contract as fetchCircuitList: /drivers and every /drivers/[driver] page
 * need it, and a missing or empty list must fail the build rather than ship a
 * Drivers section whose links all 404.
 */
export async function fetchDriverIndex(): Promise<DriverListItem[]> {
  let drivers: DriverListItem[];
  try {
    const res = await fetch(`${API_BASE_URL}/api/drivers`);
    if (!res.ok) throw new Error(`/api/drivers returned HTTP ${res.status}`);
    drivers = ((await res.json()) as { drivers?: DriverListItem[] }).drivers ?? [];
  } catch (err) {
    throw new Error(
      `[drivers] Cannot build driver pages: failed to load the driver list from the Worker ` +
        `(${API_BASE_URL}/api/drivers). ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (drivers.length === 0) {
    throw new Error('[drivers] Cannot build driver pages: /api/drivers returned an empty list.');
  }
  return drivers;
}

/** One career at build time (unauthenticated, so archive race sheets are stripped). */
export async function fetchDriverCareer(driverId: string): Promise<DriverCareer> {
  // ~600 pages fetch one each, so a single transient failure is likely over a
  // build; retry before failing it. A career that is really missing still fails.
  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/driver?driverId=${encodeURIComponent(driverId)}`);
      if (res.ok) return (await res.json()) as DriverCareer;
      lastError = `HTTP ${res.status}`;
      if (res.status === 404) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(`[drivers] /api/driver?driverId=${driverId} failed: ${lastError}`);
}

/** A driver who raced this season. Derived at read time, never stored, so a
 *  career blob written last year does not keep calling a retiree "active". */
export const isActive = (d: { lastSeason: number }) => d.lastSeason >= CURRENT_SEASON;

/** Where a season lives: the current one is the calculator's home page. */
export const seasonHref = (season: number) => (season >= CURRENT_SEASON ? '/' : `/${season}`);

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** 1235 -> "1,235", 420.5 -> "420.5". */
export const fmtPoints = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 1 });

export const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const pct = (part: number, whole: number) =>
  whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : '0%';

/** "1994, 1995, 2000–2004": consecutive years collapse into a range. */
export function yearList(years: number[]): string {
  const sorted = [...years].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(j - i >= 2 ? `${sorted[i]}–${sorted[j]}` : sorted.slice(i, j + 1).join(', '));
    i = j + 1;
  }
  return parts.join(', ');
}

const TIMES = ['', '', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

/** CSS for a two-colour team swatch, matching the calculator's stripes. */
export const teamSwatch = (t: Pick<CareerTeam, 'color' | 'secondaryColor'>) => {
  const c1 = t.color || '#9AA3AC';
  return `--c1:${c1};--c2:${t.secondaryColor || c1}`;
};

// ---------------------------------------------------------------------------
// Nationality flags
// ---------------------------------------------------------------------------

/** Jolpica nationality -> ISO 3166 alpha-2, for the emoji flag. The local
 *  /flags set only covers race-hosting countries, so drivers use emoji. */
const NATIONALITY_ISO: Record<string, string> = {
  American: 'US', Argentine: 'AR', Australian: 'AU', Austrian: 'AT', Belgian: 'BE',
  Brazilian: 'BR', British: 'GB', Canadian: 'CA', Chilean: 'CL', Chinese: 'CN',
  Colombian: 'CO', Czech: 'CZ', Danish: 'DK', Dutch: 'NL', Finnish: 'FI', French: 'FR',
  German: 'DE', Hungarian: 'HU', Indian: 'IN', Indonesian: 'ID', Irish: 'IE',
  Italian: 'IT', Japanese: 'JP', Liechtensteiner: 'LI', Malaysian: 'MY', Mexican: 'MX',
  Monegasque: 'MC', 'New Zealander': 'NZ', Polish: 'PL', Portuguese: 'PT', Russian: 'RU',
  'South African': 'ZA', Spanish: 'ES', Swedish: 'SE', Swiss: 'CH', Thai: 'TH',
  Venezuelan: 'VE', Uruguayan: 'UY', 'East German': 'DE', Rhodesian: '',
};

export function flagEmoji(nationality: string): string {
  const iso = NATIONALITY_ISO[nationality];
  if (!iso) return '';
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

/**
 * The one-sentence verdict — the page's lead and its meta description.
 * "2009 World Champion. Won 15 of 307 starts across 18 seasons, and outscored
 *  Lewis Hamilton over 58 races as teammates."
 */
export function verdict(c: DriverCareer): { lead: string; rest: string } {
  const t = c.totals;
  const seasons = `${t.seasons} season${t.seasons === 1 ? '' : 's'}`;
  const lead =
    t.titles === 0
      ? ''
      : t.titles === 1
        ? `${t.titleYears[0]} World Champion.`
        : `${TIMES[t.titles] ?? `${t.titles}-time`}-time World Champion (${yearList(t.titleYears)}).`;

  let body: string;
  if (t.wins > 0) body = `Won ${t.wins} of ${t.starts} starts across ${seasons}`;
  else if (t.podiums > 0)
    body = `${t.podiums} podium${t.podiums === 1 ? '' : 's'} from ${t.starts} starts across ${seasons}, best result ${ordinal(t.bestFinish!)}`;
  else if (t.scored > 0) body = `Scored ${fmtPoints(t.scored)} points from ${t.starts} starts across ${seasons}`;
  else body = `Started ${t.starts} Grand${t.starts === 1 ? '' : 's'} Prix across ${seasons} without scoring`;

  // One teammate clause: the teammate shared the most races with, if it is a
  // real pairing (15+ races) rather than a one-off substitute.
  const mate = c.teammates[0];
  if (mate && mate.races >= 15 && mate.points !== mate.matePoints) {
    const span = mate.seasons.length === 1 ? `in ${mate.seasons[0]}` : `over ${mate.races} races together`;
    body +=
      mate.points > mate.matePoints
        ? `, and outscored ${mate.name} ${span}`
        : `, and was outscored by ${mate.name} ${span}`;
  }
  body += '.';

  if (c.current && isActive(c)) {
    body += ` ${c.current.position ? ordinal(c.current.position) : 'Unclassified'} in ${c.current.season} with ${fmtPoints(c.current.points)} points.`;
  }
  return { lead, rest: body };
}

/** The "this season" line: can they still win it? */
export function titleLine(c: DriverCareer): string | null {
  const cur = c.current;
  if (!cur) return null;
  const left = cur.racesLeft + cur.sprintsLeft;
  const leftText = `${fmtPoints(cur.maxRemaining)} left`;
  if (left === 0) {
    return cur.position === 1 ? `${cur.season} World Champion.` : `Finished ${cur.position ? ordinal(cur.position) : 'unclassified'} in ${cur.season}.`;
  }
  if (cur.leader.driverId === c.driverId) {
    const lead = cur.rival ? cur.points - cur.rival.points : cur.points;
    return lead > cur.maxRemaining
      ? `Champion elect: ${fmtPoints(lead)} clear with only ${leftText}.`
      : `Leads by ${fmtPoints(lead)} with ${leftText}.`;
  }
  const gap = cur.leader.points - cur.points;
  return gap <= cur.maxRemaining
    ? `Still in it: ${fmtPoints(gap)} behind ${cur.leader.name} with ${leftText}.`
    : `Out of the title fight: ${fmtPoints(gap)} behind ${cur.leader.name} with ${leftText}.`;
}

// ---------------------------------------------------------------------------
// All-time ranks (computed from the index at build time)
// ---------------------------------------------------------------------------

export interface RankBadge {
  label: string;
  rank: number;
  tied: boolean;
}

const RANKED: Array<{ key: 'wins' | 'podiums' | 'titles' | 'starts' | 'points'; label: string }> = [
  { key: 'titles', label: 'titles' },
  { key: 'wins', label: 'wins' },
  { key: 'podiums', label: 'podiums' },
  { key: 'points', label: 'points' },
  { key: 'starts', label: 'starts' },
];

/** Rank badges in the top 25 for this driver, counted over everyone since 1958.
 *  Rank = 1 + drivers strictly ahead, so ties share a rank ("=3rd"). */
export function allTimeRanks(driverId: string, index: DriverListItem[]): RankBadge[] {
  const me = index.find((d) => d.driverId === driverId);
  if (!me) return [];
  const out: RankBadge[] = [];
  for (const { key, label } of RANKED) {
    if (me[key] <= 0) continue;
    const ahead = index.filter((d) => d[key] > me[key]).length;
    const level = index.filter((d) => d[key] === me[key]).length;
    if (ahead < 25) out.push({ label, rank: ahead + 1, tied: level > 1 });
  }
  return out;
}
