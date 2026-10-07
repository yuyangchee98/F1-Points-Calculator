/**
 * My 9 Races — the shapes shared by the page and the Worker.
 *
 * SHARED FILE. This folder (types, code, render, metrics) is the source of truth;
 * f1-points-calculator-api/scripts/sync-my9-shared.sh copies it to the Worker's
 * src/lib/my9/shared/, which renders the same card to PNG. Edit here, then sync,
 * or the downloaded image stops matching the preview.
 */

/** One driver, at a stable index: share codes store the index, so the list only ever grows. */
export interface My9Driver {
  id: string;
  name: string;
  last: string;
  /** /drivers/<slug>, when the driver has a page. */
  slug?: string;
}

/** One team in one season, coloured the way the calculator colours it. */
export interface My9Team {
  n: string;
  c: string;
  c2?: string;
}

/** One Grand Prix since 1958 that has a result. */
export interface My9Race {
  /** Season and round: together, the race's key in a share code. */
  y: number;
  r: number;
  /** The race's key in the season's results (toRaceId). */
  id: string;
  /** Display name that season: "Brazilian", "São Paulo", "Indianapolis 500". */
  n: string;
  /** YYYY-MM-DD */
  d: string;
  /** circuitId, as the track pages key it (the Indy 500 is its own circuit). */
  c: string;
  /** F1DB circuit layout id: the track as raced that year. */
  l: string;
  /** Winner, as a driver index. */
  w: number;
  /** The champion, when this race decided the drivers' title. */
  t?: number;
  /** 1 when the winner had never won a Grand Prix before. */
  f?: 1;
  /**
   * Everyone who started, as flat [driver, team] index pairs. Archive seasons
   * (before `open`) are A–Z with no positions — who started a race is public,
   * the classification is what the archive sells. Open seasons are in finishing
   * order with `p` alongside.
   */
  e: number[];
  /** Open seasons only: the classified position of each entrant, aligned with `e`. */
  p?: number[];
}

export interface My9Catalog {
  v: 1;
  built: string;
  /** First season whose full classification is free (PAID_SEASON_THRESHOLD). */
  open: number;
  /** Fingerprint of the layout set, so the client can cache /api/my9/layouts by it. */
  lv: string;
  drivers: My9Driver[];
  /** season -> that season's teams, indexed by `e`'s team slot. */
  teams: Record<string, My9Team[]>;
  /** circuitId -> [track page slug, venue name, country] */
  tracks: Record<string, [string, string, string]>;
  /** Oldest first. */
  races: My9Race[];
}

/** layoutId -> [path d, bbox x, y, w, h] */
export type My9Layouts = Record<string, [string, number, number, number, number]>;

/** One tile in a grid: a race, the driver it's remembered for, and why. */
export interface My9Pick {
  y: number;
  r: number;
  /** Driver index into My9Catalog.drivers. */
  d: number;
  /** 0 = no sticker, else 1-based into STICKERS. */
  s: number;
}

export const STICKERS = [
  { id: 'there', label: 'I was there' },
  { id: 'start', label: 'Where it started' },
  { id: 'drive', label: 'The drive' },
  { id: 'heart', label: 'Heartbreak' },
  { id: 'robbed', label: 'Robbed' },
  { id: 'chaos', label: 'Chaos' },
] as const;

export type StickerId = (typeof STICKERS)[number]['id'];

/** "Where it started" — one per grid; it sets "Fan since" on the card. */
export const START_STICKER = 2;

export const SITE_HOST = 'f1pointscalculator.chyuang.com';
export const MY9_PATH = '/my9';
