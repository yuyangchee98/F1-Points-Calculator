/**
 * Share codes: a whole grid in the URL, so sharing never writes to a database and
 * a code — and the image rendered from it — never changes.
 *
 *   6 bits   version (1)
 *   9 × 26   per tile, in grid order:
 *              7  season − 1950
 *              6  round
 *             10  driver, as an index into My9Catalog.drivers (append-only)
 *              3  sticker, 0 = none
 *
 * 240 bits = 30 bytes = 40 base64url characters.
 *
 * The driver is a catalog-wide index rather than a position in the race's entry
 * list: a corrected result can add or drop a row from a race, which would shift
 * every later entrant and silently change the driver in old links.
 *
 * SHARED FILE — see types.ts.
 */
import { STICKERS, type My9Pick } from './types';

export const CODE_VERSION = 1;
export const CODE_LENGTH = 40;
const SEASON_BASE = 1950;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const FIELDS: Array<[keyof My9Pick, number]> = [['y', 7], ['r', 6], ['d', 10], ['s', 3]];

/** A grid of exactly nine tiles -> its code. Throws on anything out of range. */
export function encodePicks(picks: readonly My9Pick[]): string {
  if (picks.length !== 9) throw new Error('a code needs nine tiles');
  const bits: number[] = [];
  const push = (value: number, width: number) => {
    if (!Number.isInteger(value) || value < 0 || value >= 1 << width) throw new Error(`value ${value} does not fit ${width} bits`);
    for (let b = width - 1; b >= 0; b--) bits.push((value >> b) & 1);
  };
  push(CODE_VERSION, 6);
  for (const p of picks) {
    for (const [key, width] of FIELDS) push(key === 'y' ? p.y - SEASON_BASE : p[key], width);
  }
  let out = '';
  for (let i = 0; i < bits.length; i += 6) {
    let v = 0;
    for (let b = 0; b < 6; b++) v = (v << 1) | (bits[i + b] ?? 0);
    out += ALPHABET[v];
  }
  return out;
}

/** A code -> nine picks, or null when it is not a well-formed v1 code. */
export function decodeCode(code: string): My9Pick[] | null {
  if (typeof code !== 'string' || code.length !== CODE_LENGTH) return null;
  const bits: number[] = [];
  for (const ch of code) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    for (let b = 5; b >= 0; b--) bits.push((v >> b) & 1);
  }
  let at = 0;
  const read = (width: number) => {
    let v = 0;
    for (let b = 0; b < width; b++) v = (v << 1) | bits[at++];
    return v;
  };
  if (read(6) !== CODE_VERSION) return null;
  const picks: My9Pick[] = [];
  for (let i = 0; i < 9; i++) {
    const p = { y: read(7) + SEASON_BASE, r: read(6), d: read(10), s: read(3) };
    if (p.r < 1 || p.s > STICKERS.length) return null;
    picks.push(p);
  }
  return picks;
}

/** The race half of a pick, as one string: "2008-18". */
export const raceKey = (p: { y: number; r: number }) => `${p.y}-${p.r}`;
