/**
 * The page's side of My 9: loading the catalog, searching it, and the draft.
 * Not shared with the Worker (see types.ts for what is).
 */
import { API_BASE_URL } from '../constants';
import { raceKey } from './code';
import { FAMOUS } from './famous';
import { CARD_VERSION, entrantsOf, gpLabel, indexCatalog, type CatalogIndex } from './render';
import type { My9Catalog, My9Layouts, My9Pick, My9Race } from './types';

export interface My9Data {
  ix: CatalogIndex;
  layouts: My9Layouts;
  /** raceKey -> curated entry: the star, the "famous" chip, search words and suggestions. */
  famous: Map<string, { tags: string; drivers: number[] }>;
  hay: Map<string, string>;
  driverIndex: Map<string, number>;
}

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let loading: Promise<My9Data> | null = null;

export function loadMy9(): Promise<My9Data> {
  loading ??= (async () => {
    const catalog = await fetch(`${API_BASE_URL}/api/my9/catalog`).then((r) => {
      if (!r.ok) throw new Error(`catalog ${r.status}`);
      return r.json() as Promise<My9Catalog>;
    });
    // By the catalog's layout version: cached for good, and a new circuit's
    // layout arrives with the catalog that first names it.
    const layouts = await fetch(`${API_BASE_URL}/api/my9/layouts?v=${catalog.lv}`).then((r) => {
      if (!r.ok) throw new Error(`layouts ${r.status}`);
      return r.json() as Promise<My9Layouts>;
    });
    return prepare(catalog, layouts);
  })().catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

function prepare(catalog: My9Catalog, layouts: My9Layouts): My9Data {
  const ix = indexCatalog(catalog);
  const driverIndex = new Map(catalog.drivers.map((d, i) => [d.id, i]));
  const byIdKey = new Map(catalog.races.map((r) => [`${r.y}:${r.id}`, r]));

  const famous: My9Data['famous'] = new Map();
  for (const f of FAMOUS) {
    const race = byIdKey.get(`${f.y}:${f.race}`);
    if (!race) continue;
    const starters = new Set(entrantsOf(race).map((e) => e.d));
    const drivers = f.drivers.map((id) => driverIndex.get(id)).filter((d): d is number => d !== undefined && starters.has(d));
    famous.set(raceKey(race), { tags: f.tags, drivers });
  }

  const hay = new Map<string, string>();
  for (const race of catalog.races) {
    const track = catalog.tracks[race.c];
    const teams = catalog.teams[String(race.y)] ?? [];
    const words = [String(race.y), race.n, gpLabel(race), track?.[1] ?? '', track?.[2] ?? '', famous.get(raceKey(race))?.tags ?? ''];
    for (const e of entrantsOf(race)) words.push(catalog.drivers[e.d]?.name ?? '', teams[e.team]?.n ?? '');
    hay.set(raceKey(race), norm(words.join(' ')));
  }
  return { ix, layouts, famous, hay, driverIndex };
}

/* ---------------------------------------------------------------- search -- */

export interface RaceHit {
  race: My9Race;
  /** The driver this row would add: one the query names, else the winner. */
  hero: number;
  /** Relevance to the query: the named driver's wins and titles, then fame. */
  score: number;
}

export type ListSort = 'best' | 'newest' | 'oldest';

/** Words that filter rather than match: the chips under the search box. */
const FILTERS: Record<string, (r: My9Race, data: My9Data) => boolean> = {
  famous: (r, data) => data.famous.has(raceKey(r)),
  'title deciders': (r) => r.t !== undefined,
  'first wins': (r) => r.f === 1,
};

/**
 * Every race matching all of the query's words (no query: every race). A word
 * that names a driver who started the race makes them the row's driver:
 * searching "senna" offers Senna's tiles, not the winners'. Unordered — see
 * orderHits.
 */
export function searchRaces(data: My9Data, query: string): { hits: RaceHit[]; searching: boolean } {
  const { catalog } = data.ix;
  let q = norm(query).trim();
  const filters: Array<(r: My9Race, data: My9Data) => boolean> = [];
  for (const [phrase, fn] of Object.entries(FILTERS)) {
    if (q.includes(phrase)) {
      filters.push(fn);
      q = q.replace(phrase, ' ').trim();
    }
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  const nameTokens = tokens.filter((t) => t.length >= 3 && !/^\d+$/.test(t));
  const hits: RaceHit[] = [];
  for (const race of catalog.races) {
    if (!filters.every((f) => f(race, data))) continue;
    const key = raceKey(race);
    const hay = data.hay.get(key)!;
    const ok = tokens.every((t) => (/^\d{2}$/.test(t) ? String(race.y).slice(2) === t || hay.includes(t) : hay.includes(t)));
    if (!ok) continue;
    const fam = data.famous.get(key)?.drivers ?? [];
    // With no driver named, a curated race offers the driver it is famous for.
    let hero = fam[0] ?? race.w;
    let named = false;
    if (nameTokens.length) {
      // The starter the query names best: "michael schumacher" must pick
      // Michael over Ralf, who matches one word of it.
      let best = 0;
      for (const d of [...fam, ...entrantsOf(race).map((e) => e.d)]) {
        const name = norm(catalog.drivers[d]?.name ?? '');
        const n = nameTokens.filter((t) => name.includes(t)).length;
        if (n > best) {
          best = n;
          hero = d;
          named = true;
        }
      }
    }
    let score = 0;
    if (named && race.w === hero) score += 4;
    if (named && race.t === hero) score += 3;
    if (data.famous.has(key)) score += 2;
    hits.push({ race, hero, score });
  }
  // A chip on its own is a search too: "famous" lists the famous races.
  return { hits, searching: tokens.length > 0 || filters.length > 0 };
}

/**
 * Best match: relevance, then newest. Newest/oldest: by season, and within a
 * season always in calendar order — a season reads round 1 to the finale
 * whichever way the seasons run.
 */
export function orderHits(hits: RaceHit[], sort: ListSort): RaceHit[] {
  const out = [...hits];
  if (sort === 'best') return out.sort((a, b) => b.score - a.score || b.race.d.localeCompare(a.race.d));
  const dir = sort === 'newest' ? -1 : 1;
  return out.sort((a, b) => (a.race.y !== b.race.y ? dir * (a.race.y - b.race.y) : a.race.r - b.race.r));
}

/**
 * Who to offer for a race, most likely first: the curated names, the champion
 * if it was decided here, the winner, then the podium where results are open.
 */
export function suggestedDrivers(data: My9Data, race: My9Race, current: number): number[] {
  const out: number[] = [];
  const add = (d: number | undefined) => {
    if (d !== undefined && !out.includes(d)) out.push(d);
  };
  add(race.w);
  for (const d of data.famous.get(raceKey(race))?.drivers ?? []) add(d);
  add(race.t);
  if (race.p) for (const e of entrantsOf(race)) if (e.pos !== undefined && e.pos <= 3) add(e.d);
  add(current);
  return out.slice(0, 6);
}

/* ----------------------------------------------------------------- draft -- */

export type Slots = Array<My9Pick | null>;

const DRAFT_KEY = 'my9:draft:v1';
const NAME_KEY = 'my9:name';

export const emptySlots = (): Slots => Array.from({ length: 9 }, () => null);

export function readDraft(): Slots {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
    if (Array.isArray(raw) && raw.length === 9) {
      return raw.map((p) =>
        p && typeof p.y === 'number' && typeof p.r === 'number' && typeof p.d === 'number' ? { y: p.y, r: p.r, d: p.d, s: typeof p.s === 'number' ? p.s : 0 } : null
      );
    }
  } catch {
    // Storage blocked or garbled: start empty.
  }
  return emptySlots();
}

export function writeDraft(slots: Slots): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(slots));
  } catch {
    // Private mode: the grid still works, it just won't survive a reload.
  }
}

export function readName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}

/* ----------------------------------------------------------------- links -- */

export const SHARE_ORIGIN = 'https://f1pointscalculator.chyuang.com';
export const shareUrl = (code: string) => `${SHARE_ORIGIN}/my9/${code}`;
export const pngUrl = (code: string, f: 'og' | 'post' | 'story', name: string) =>
  `${API_BASE_URL}/my9/${code}.png?f=${f}&v=${CARD_VERSION}${name && f !== 'og' ? `&n=${encodeURIComponent(name)}` : ''}`;

/** The calculator page for a season; archive seasons tag the paywall with My 9. */
export const seasonHref = (y: number, current: number) => (y === current ? '/?from=my9' : `/${y}?from=my9`);
