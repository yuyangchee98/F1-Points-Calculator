/**
 * The My 9 tile and card, as SVG strings.
 *
 * One renderer for every surface: the page injects these strings into the DOM,
 * and the Worker hands the very same string to resvg for the PNG people post. So
 * nothing here may depend on a browser — text is measured from Archivo's own
 * advance widths (metrics.ts), every font is Archivo, and ids are passed in rather
 * than drawn from a global counter.
 *
 * SHARED FILE — see types.ts.
 */
import { RANGES, UNITS_PER_EM, WIDTHS } from './metrics';
import { raceKey } from './code';
import {
  MY9_PATH,
  SITE_HOST,
  STICKERS,
  START_STICKER,
  type My9Catalog,
  type My9Layouts,
  type My9Pick,
  type My9Race,
  type StickerId,
} from './types';

export const FONT = "Archivo, 'Archivo-fallback', system-ui, sans-serif";

/**
 * Bump when the card's drawing changes. It is part of every image URL and the
 * Worker's cache key, so a redesign is not hidden behind week-old cached PNGs
 * (a code alone never changes, so it cannot be the cache key on its own).
 */
export const CARD_VERSION = 3;
const INK = '#15181C';
const INK2 = '#4F5760';
const MUTED = '#6E7780';
const BORDER = '#DFE3E6';
const GOLD = '#C4920A';
const RED = '#E10600';
const BLUE = '#2563EB';
const SITE = `${SITE_HOST}${MY9_PATH}`;

/* ------------------------------------------------------------------ text -- */

type Weight = 500 | 700 | 800;

const SLOT = new Map<number, number>();
{
  let i = 0;
  for (const [a, b] of RANGES) for (let c = a; c <= b; c++) SLOT.set(c, i++);
}

/** Width of `str` in px at `size`, from Archivo's advance widths. */
export function textWidth(str: string, size: number, weight: Weight, spacing = 0): number {
  const widths = WIDTHS[weight];
  let units = 0;
  let n = 0;
  for (const ch of str) {
    const slot = SLOT.get(ch.codePointAt(0)!);
    // A character outside the table renders in a fallback face; budget it as
    // a wide one rather than let it overflow.
    units += slot === undefined ? 620 : widths[slot];
    n++;
  }
  return (units / UNITS_PER_EM) * size + spacing * n;
}

/**
 * Fit text to a width: shrink to `minScale`, then cut with an ellipsis. Long
 * names are the norm here ("Emilia Romagna GP", "VON TRIPS"), not the exception.
 */
export function fitText(str: string, maxW: number, size: number, weight: Weight, minScale = 0.8): { text: string; size: number } {
  const w = textWidth(str, size, weight);
  if (w <= maxW) return { text: str, size };
  const scaled = size * Math.max(minScale, maxW / w);
  if (textWidth(str, scaled, weight) <= maxW) return { text: str, size: scaled };
  const chars = [...str];
  while (chars.length > 1 && textWidth(chars.join('') + '…', scaled, weight) > maxW) chars.pop();
  return { text: chars.join('').trimEnd() + '…', size: scaled };
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const n2 = (v: number) => Math.round(v * 100) / 100;

function luminance(hex: string): number {
  const v = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(v >> 16) + 0.7152 * f((v >> 8) & 255) + 0.0722 * f(v & 255);
}
/** Ink on a light livery, white on a dark one. */
export const inkOn = (hex: string) => (luminance(hex) > 0.4 ? INK : '#FFFFFF');

/* --------------------------------------------------------------- catalog -- */

export interface CatalogIndex {
  catalog: My9Catalog;
  byKey: Map<string, My9Race>;
}

export function indexCatalog(catalog: My9Catalog): CatalogIndex {
  return { catalog, byKey: new Map(catalog.races.map((r) => [raceKey(r), r])) };
}

export interface Entrant {
  d: number;
  team: number;
  /** Open seasons only. */
  pos?: number;
}

export function entrantsOf(race: My9Race): Entrant[] {
  const out: Entrant[] = [];
  for (let i = 0; i < race.e.length; i += 2) {
    out.push({ d: race.e[i], team: race.e[i + 1], ...(race.p ? { pos: race.p[i / 2] } : {}) });
  }
  return out;
}

/** "Brazilian GP"; the Indy 500 already names itself. */
export const gpLabel = (race: My9Race) => (/\b500$/.test(race.n) ? race.n : `${race.n} GP`);

/** Everything a tile draws, resolved from a pick. */
export interface TileView {
  key: string;
  year: number;
  gp: string;
  d: number;
  driverId: string;
  name: string;
  last: string;
  team: string;
  c1: string;
  c2?: string;
  layout: [string, number, number, number, number] | null;
  /** The chosen driver clinched the title at this race. */
  title: boolean;
  /** The chosen driver won, for the first time. */
  first: boolean;
  winner: boolean;
  sticker: number;
}

/**
 * Resolve a pick against the catalog. A driver who did not start the race (a
 * hand-edited code, or a corrected result) falls back to the winner rather than
 * failing the whole grid. Null only when the race itself is unknown.
 */
export function resolveTile(ix: CatalogIndex, layouts: My9Layouts, pick: My9Pick): TileView | null {
  const race = ix.byKey.get(raceKey(pick));
  if (!race) return null;
  const entrants = entrantsOf(race);
  const ent = entrants.find((e) => e.d === pick.d) ?? entrants.find((e) => e.d === race.w) ?? entrants[0];
  if (!ent) return null;
  const driver = ix.catalog.drivers[ent.d];
  const team = ix.catalog.teams[String(race.y)]?.[ent.team] ?? { n: '', c: '#999999' };
  return {
    key: raceKey(race),
    year: race.y,
    gp: gpLabel(race),
    d: ent.d,
    driverId: driver?.id ?? '',
    name: driver?.name ?? '',
    last: driver?.last ?? '',
    team: team.n,
    c1: team.c,
    c2: team.c2,
    layout: layouts[race.l] ?? null,
    title: race.t === ent.d,
    first: race.f === 1 && race.w === ent.d,
    winner: race.w === ent.d,
    sticker: pick.s >= 1 && pick.s <= STICKERS.length ? pick.s : 0,
  };
}

/* ---------------------------------------------------------------- glyphs -- */

function trophyIcon(x: number, y: number, k: number, c: string): string {
  return `<g transform="translate(${n2(x)} ${n2(y)}) scale(${n2(k * 1000) / 1000})" fill="${c}"><path d="M3.5 1h9v4.2a4.5 4.5 0 0 1-9 0z"/><path d="M3.6 2.6H1.4v1.3a2.7 2.7 0 0 0 2.7 2.7M12.4 2.6h2.2v1.3a2.7 2.7 0 0 1-2.7 2.7" fill="none" stroke="${c}" stroke-width="1.3"/><rect x="7.1" y="9.5" width="1.8" height="3"/><rect x="4.5" y="12.4" width="7" height="2.1"/></g>`;
}

/** Gold square, white trophy: this race decided the title. */
export function trophyBadge(x: number, y: number, h: number): string {
  return `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(h)}" height="${n2(h)}" rx="${n2(h * 0.2)}" fill="${GOLD}"/>` + trophyIcon(x + h * 0.17, y + h * 0.16, (h * 0.66) / 16, '#FFFFFF');
}

export const FIRST_BADGE_RATIO = 1.45;

/** "1ST": the driver's first Grand Prix win. White on a livery, ink on paper. */
export function firstBadge(x: number, y: number, h: number, dark = false): string {
  const w = h * FIRST_BADGE_RATIO;
  return (
    `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(h * 0.2)}" fill="${dark ? INK : '#FFFFFF'}"/>` +
    `<text x="${n2(x + w / 2)}" y="${n2(y + h * 0.72)}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${n2(h * 0.54)}" fill="${dark ? '#FFFFFF' : INK}">1ST</text>`
  );
}

/** The six stickers, drawn in a 24-unit box. */
export function stickerArt(id: StickerId | string): string {
  switch (id) {
    case 'there':
      return `<path d="M3.5 7.5h17v3a1.8 1.8 0 0 0 0 3.6v3h-17v-3a1.8 1.8 0 0 0 0-3.6z" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M14.5 8.5v7" stroke="${INK}" stroke-width="2" stroke-dasharray="1.6 1.9"/>`;
    case 'start':
      return `<rect x="3" y="6.5" width="18" height="12.5" rx="2" fill="none" stroke="${INK}" stroke-width="2"/><path d="M10.2 10v5.4l4.6-2.7z" fill="${RED}"/><path d="M8.5 3.2l3.5 3.1 3.5-3.1" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'drive':
      return `<circle cx="12" cy="12" r="8.5" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="2.4" fill="${INK}"/><path d="M3.8 11.2h6M14.2 11.2h6M12 14.4v6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    case 'heart':
      return `<path d="M12 20.5s-7.6-4.6-7.6-10.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.6 2.5c0 5.8-7.6 10.4-7.6 10.4z" fill="${RED}"/><path d="M12.7 7.8l-2.1 3.5 2.7 1.6-1.9 3.6" fill="none" stroke="#FFFFFF" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>`;
    case 'robbed':
      return `<path d="M6.5 17v-4.6a5.5 5.5 0 0 1 11 0V17z" fill="${RED}"/><path d="M9.3 12.2a2.8 2.8 0 0 1 2.7-2.4" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/><rect x="4.5" y="17" width="15" height="3.6" rx="1" fill="${INK}"/><path d="M12 2.6v2.3M4.4 5.6l1.6 1.6M19.6 5.6L18 7.2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    case 'chaos':
      return `<path d="M7.3 14.6a3.7 3.7 0 0 1-.3-7.4A5 5 0 0 1 16.6 8a3.3 3.3 0 0 1 .4 6.6z" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M8.6 17.6l-1 2.6M12.6 17.6l-1 2.6M16.6 17.6l-1 2.6" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>`;
  }
  return '';
}

export const stickerId = (s: number): StickerId | null => (s >= 1 && s <= STICKERS.length ? STICKERS[s - 1].id : null);

/* ------------------------------------------------------------------ tile -- */

export interface TileOptions {
  /** Field only, for list rows: no strip, no text, a bigger track. */
  mini?: boolean;
  /** Extra attributes on the tile's <g> (the page's slot handles). */
  attrs?: string;
  /** Unique within the SVG document the tile lands in. */
  id: string;
  /** Page-only: a hover tooltip. */
  title?: string;
}

function trackPlacement(layout: [string, number, number, number, number], s: number, mini: boolean) {
  const [, bx, by, bw, bh] = layout;
  const fieldH = mini ? s : s * 0.75;
  const box = mini
    ? { x: s * 0.14, y: s * 0.14, w: s * 0.72, h: s * 0.72 }
    : { x: s * 0.14, y: s * 0.2, w: s * 0.72, h: fieldH - s * 0.26 };
  const sc = Math.min(box.w / Math.max(bw, 1), box.h / Math.max(bh, 1));
  return { sc, tx: box.x + (box.w - bw * sc) / 2 - bx * sc, ty: box.y + (box.h - bh * sc) / 2 - by * sc };
}

/** One tile: the chosen driver's livery, the track as raced, year, driver card strip. */
export function tile(t: TileView, x: number, y: number, s: number, o: TileOptions): string {
  const mini = !!o.mini;
  const fg = inkOn(t.c1);
  const rad = s * (mini ? 0.1 : 0.045);
  const stripH = mini ? 0 : s * 0.25;
  const fieldH = s - stripH;
  const cid = `${o.id}c`;
  let g = `<g transform="translate(${n2(x)} ${n2(y)})"${o.attrs ? ` ${o.attrs}` : ''}>${o.title ? `<title>${esc(o.title)}</title>` : ''}`;
  g += `<clipPath id="${cid}"><rect width="${n2(s)}" height="${n2(s)}" rx="${n2(rad)}"/></clipPath><g clip-path="url(#${cid})">`;
  g += `<rect width="${n2(s)}" height="${n2(s)}" fill="${t.c1}"/>`;
  if (t.layout) {
    const { sc, tx, ty } = trackPlacement(t.layout, s, mini);
    const sw = (mini ? s * 0.055 : s * 0.024) / sc;
    g += `<path d="${t.layout[0]}" transform="translate(${n2(tx)} ${n2(ty)}) scale(${n2(sc * 10000) / 10000})" fill="none" stroke="${fg}" stroke-width="${n2(sw)}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  if (!mini) {
    g += `<text x="${n2(s * 0.07)}" y="${n2(s * 0.155)}" font-family="${FONT}" font-weight="800" font-size="${n2(s * 0.115)}" letter-spacing="${n2(-s * 0.002)}" fill="${fg}">${t.year}</text>`;
    const bh = s * 0.115;
    let bx = s * 0.93;
    if (t.title) {
      bx -= bh;
      g += trophyBadge(bx, s * 0.06, bh);
      bx -= s * 0.025;
    }
    if (t.first) {
      bx -= bh * FIRST_BADGE_RATIO;
      g += firstBadge(bx, s * 0.06, bh);
    }
    // The driver card, as on the calculator grid: team stripe, SURNAME, and
    // the Grand Prix in muted text where a card puts the team.
    g += `<rect y="${n2(fieldH)}" width="${n2(s)}" height="${n2(stripH)}" fill="#FFFFFF"/>`;
    g += `<rect y="${n2(fieldH)}" width="${n2(s)}" height="${n2(Math.max(1, s * 0.004))}" fill="${BORDER}"/>`;
    const stripeW = s * 0.028;
    if (t.c2) {
      g += `<rect y="${n2(fieldH)}" width="${n2(stripeW)}" height="${n2(stripH / 2)}" fill="${t.c1}"/><rect y="${n2(fieldH + stripH / 2)}" width="${n2(stripeW)}" height="${n2(stripH / 2)}" fill="${t.c2}"/>`;
    } else {
      g += `<rect y="${n2(fieldH)}" width="${n2(stripeW)}" height="${n2(stripH)}" fill="${t.c1}"/>`;
    }
    const tx = s * 0.085;
    // The sticker disc sits over the strip's top-right corner; keep the
    // surname clear of it.
    const nameMax = (t.sticker ? s * 0.73 : s * 0.95) - tx;
    const nm = fitText(t.last.toUpperCase(), nameMax, s * 0.086, 800, 0.72);
    g += `<text x="${n2(tx)}" y="${n2(fieldH + stripH * 0.46)}" font-family="${FONT}" font-weight="800" font-size="${n2(nm.size)}" fill="${INK}">${esc(nm.text)}</text>`;
    const gp = fitText(t.gp, s * 0.95 - tx, s * 0.066, 500, 0.8);
    g += `<text x="${n2(tx)}" y="${n2(fieldH + stripH * 0.8)}" font-family="${FONT}" font-weight="500" font-size="${n2(gp.size)}" fill="${MUTED}">${esc(gp.text)}</text>`;
  }
  g += `</g><rect x="${n2(s * 0.002)}" y="${n2(s * 0.002)}" width="${n2(s * 0.996)}" height="${n2(s * 0.996)}" rx="${n2(rad)}" fill="none" stroke="rgba(21,24,28,.14)" stroke-width="${n2(Math.max(1, s * 0.004))}"/>`;
  const sid = stickerId(t.sticker);
  if (!mini && sid) {
    const cr = s * 0.105, cx = s * 0.845, cy = fieldH - s * 0.005, is = s * 0.13;
    g += `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(cr)}" fill="#FFFFFF" stroke="rgba(21,24,28,.16)" stroke-width="${n2(s * 0.006)}"/>`;
    g += `<g transform="translate(${n2(cx - is / 2)} ${n2(cy - is / 2)}) scale(${n2((is / 24) * 1000) / 1000})">${stickerArt(sid)}</g>`;
  }
  return g + '</g>';
}

/**
 * A tile as its own <svg>, for list rows and sheets. Clip ids are document-wide
 * in HTML, so these get their own namespace ("m…") apart from a card's tiles —
 * a shared id makes one tile clip to another's geometry.
 */
export const tileSvg = (t: TileView, id: string, mini = false) =>
  `<svg viewBox="0 0 200 200" aria-hidden="true">${tile(t, 0, 0, 200, { id: `m${id}`, mini })}</svg>`;

/* ------------------------------------------------------------------ card -- */

export type CardFormat = 'post' | 'story' | 'link';

export const CARD_SIZE: Record<CardFormat, { W: number; H: number }> = {
  post: { W: 1080, H: 1350 },
  story: { W: 1080, H: 1920 },
  link: { W: 1200, H: 630 },
};

export interface CardFacts {
  /** The season of the tile stickered "Where it started". */
  fanSince: number | null;
  /** One driver on three or more tiles. */
  loyalty: { last: string; c1: string; c2?: string; n: number } | null;
  titles: number;
  firsts: number;
}

export function cardFacts(tiles: ReadonlyArray<TileView | null>): CardFacts {
  const sel = tiles.filter((t): t is TileView => !!t);
  const start = sel.find((t) => t.sticker === START_STICKER);
  const counts = new Map<number, number>();
  for (const t of sel) counts.set(t.d, (counts.get(t.d) ?? 0) + 1);
  let best: [number, number] | null = null;
  for (const [d, n] of counts) if (!best || n > best[1]) best = [d, n];
  let loyalty: CardFacts['loyalty'] = null;
  if (best && best[1] >= 3) {
    // Their colours from the latest of those tiles: a Hamilton loyalist's chip
    // is in the team they followed him to most recently in the grid.
    const last = [...sel].reverse().find((t) => t.d === best![0])!;
    loyalty = { last: last.last, c1: last.c1, c2: last.c2, n: best[1] };
  }
  return {
    fanSince: start ? start.year : null,
    loyalty,
    titles: sel.filter((t) => t.title).length,
    firsts: sel.filter((t) => t.first).length,
  };
}

const RULER_FROM = 1958;
const RULER_TO = 2026;

/** The era axis, like the driver page's season chart: one livery tick per pick. */
function ruler(x0: number, x1: number, y: number, sel: TileView[], k: number): string {
  const to = Math.max(RULER_TO, ...sel.map((t) => t.year));
  const X = (yr: number) => x0 + ((yr - RULER_FROM) / (to - RULER_FROM)) * (x1 - x0);
  let g = `<rect x="${n2(x0)}" y="${n2(y - k)}" width="${n2(x1 - x0)}" height="${n2(2 * k)}" fill="${BORDER}"/>`;
  for (let d = 1960; d <= to; d += 10) {
    g += `<text x="${n2(X(d))}" y="${n2(y + 26 * k)}" text-anchor="middle" font-family="${FONT}" font-size="${n2(16 * k)}" font-weight="700" fill="${MUTED}">’${String(d).slice(2)}</text>`;
  }
  // Picks from one season sit side by side, centred on their year and kept
  // inside the axis — nine 2026 picks must not run off the card.
  const w = 11 * k, h = 34 * k, gap = 2 * k;
  const byYear = new Map<number, TileView[]>();
  for (const t of sel) byYear.set(t.year, [...(byYear.get(t.year) ?? []), t]);
  for (const [yr, group] of byYear) {
    const total = group.length * w + (group.length - 1) * gap;
    const start = Math.min(Math.max(X(yr) - total / 2, x0), x1 - total);
    group.forEach((t, n) => {
      g += `<rect x="${n2(start + n * (w + gap))}" y="${n2(y - h - k)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(2 * k)}" fill="${t.c1}" stroke="rgba(21,24,28,.18)" stroke-width="${n2(k)}"/>`;
    });
  }
  return g;
}

/** White pills like the track page's "18 first-time winners"; the loyalty chip is a mini driver card. */
function pills(x: number, y: number, facts: CardFacts, k: number, ids: string): string {
  const H = 40 * k, fs = 18 * k, ih = 24 * k;
  const items: Array<{ w: number; draw: (cx: number, w: number) => string }> = [];
  const loy = facts.loyalty;
  if (loy) {
    const label = loy.last.toUpperCase();
    items.push({
      w: 16 * k + textWidth(label, fs, 800) + textWidth(` ×${loy.n}`, fs, 700) + 14 * k,
      draw: (cx, w) => {
        const top = y - H / 2;
        const stripe = loy.c2
          ? `<rect x="${n2(cx)}" y="${n2(top)}" width="${n2(6 * k)}" height="${n2(H / 2)}" fill="${loy.c1}"/><rect x="${n2(cx)}" y="${n2(y)}" width="${n2(6 * k)}" height="${n2(H / 2)}" fill="${loy.c2}"/>`
          : `<rect x="${n2(cx)}" y="${n2(top)}" width="${n2(6 * k)}" height="${n2(H)}" fill="${loy.c1}"/>`;
        return (
          `<clipPath id="${ids}lc"><rect x="${n2(cx)}" y="${n2(top)}" width="${n2(w)}" height="${n2(H)}" rx="${n2(8 * k)}"/></clipPath>` +
          `<g clip-path="url(#${ids}lc)"><rect x="${n2(cx)}" y="${n2(top)}" width="${n2(w)}" height="${n2(H)}" fill="#FFFFFF"/>${stripe}</g>` +
          `<rect x="${n2(cx)}" y="${n2(top)}" width="${n2(w)}" height="${n2(H)}" rx="${n2(8 * k)}" fill="none" stroke="${BORDER}" stroke-width="${n2(1.5 * k)}"/>` +
          `<text x="${n2(cx + 16 * k)}" y="${n2(y + fs * 0.36)}" font-family="${FONT}" font-size="${n2(fs)}" fill="${INK}"><tspan font-weight="800">${esc(label)}</tspan><tspan font-weight="700" fill="${INK2}"> ×${loy.n}</tspan></text>`
        );
      },
    });
  }
  const iconPill = (n: number, label: string, iw: number, icon: (ix: number, iy: number) => string) => ({
    w: 10 * k + iw + 9 * k + textWidth(String(n), fs, 800) + textWidth(` ${label}`, fs, 500) + 14 * k,
    draw: (cx: number, w: number) =>
      `<rect x="${n2(cx)}" y="${n2(y - H / 2)}" width="${n2(w)}" height="${n2(H)}" rx="${n2(8 * k)}" fill="#FFFFFF" stroke="${BORDER}" stroke-width="${n2(1.5 * k)}"/>` +
      icon(cx + 10 * k, y - ih / 2) +
      `<text x="${n2(cx + 10 * k + iw + 9 * k)}" y="${n2(y + fs * 0.36)}" font-family="${FONT}" font-size="${n2(fs)}" fill="${INK}"><tspan font-weight="800">${n}</tspan><tspan font-weight="500" fill="${INK2}"> ${label}</tspan></text>`,
  });
  if (facts.titles) items.push(iconPill(facts.titles, facts.titles === 1 ? 'title decider' : 'title deciders', ih, (ix, iy) => trophyBadge(ix, iy, ih)));
  if (facts.firsts) items.push(iconPill(facts.firsts, facts.firsts === 1 ? 'first win' : 'first wins', ih * FIRST_BADGE_RATIO, (ix, iy) => firstBadge(ix, iy, ih, true)));
  let g = '';
  let cx = x;
  for (const it of items) {
    g += it.draw(cx, it.w);
    cx += it.w + 8 * k;
  }
  return g;
}

/** The stickers this grid uses, in sticker order — what the key has to explain. */
export const stickersUsed = (tiles: ReadonlyArray<TileView | null>) =>
  STICKERS.map((_, i) => i + 1).filter((s) => tiles.some((t) => t?.sticker === s));

/**
 * The key to the sticker discs, so someone seeing only the image can read
 * them: each used sticker as its disc and its name, in even columns.
 * Right-aligned blocks end at x + maxW. Returns the height drawn.
 */
function stickerKey(used: number[], x: number, y: number, maxW: number, k: number, align: 'left' | 'right'): { svg: string; h: number } {
  if (!used.length) return { svg: '', h: 0 };
  const fs = 18 * k, d = 30 * k, gap = 9 * k, colGap = 22 * k, rowH = 38 * k;
  const itemW = Math.max(...used.map((s) => d + gap + textWidth(STICKERS[s - 1].label, fs, 700)));
  // As many columns as fit, then evened out: five stickers in four columns
  // read as 3 + 2, not 4 + 1.
  const fit = Math.max(1, Math.min(used.length, Math.floor((maxW + colGap) / (itemW + colGap))));
  const cols = Math.ceil(used.length / Math.ceil(used.length / fit));
  const blockW = cols * itemW + (cols - 1) * colGap;
  const x0 = align === 'right' ? x + maxW - blockW : x;
  let svg = '';
  used.forEach((s, i) => {
    const cx = x0 + (i % cols) * (itemW + colGap) + d / 2;
    const cy = y + Math.floor(i / cols) * rowH + d / 2;
    const is = d * 0.66;
    svg += `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2)}" fill="#FFFFFF" stroke="rgba(21,24,28,.16)" stroke-width="${n2(1.5 * k)}"/>`;
    svg += `<g transform="translate(${n2(cx - is / 2)} ${n2(cy - is / 2)}) scale(${n2((is / 24) * 1000) / 1000})">${stickerArt(STICKERS[s - 1].id)}</g>`;
    svg += `<text x="${n2(cx + d / 2 + gap)}" y="${n2(cy + fs * 0.36)}" font-family="${FONT}" font-weight="700" font-size="${n2(fs)}" fill="${INK2}">${esc(STICKERS[s - 1].label)}</text>`;
  });
  return { svg, h: Math.ceil(used.length / cols) * rowH - (rowH - d) };
}

const logoWidth = (k: number) => 52 * k + textWidth('Points Calculator', 21 * k, 700, -0.3 * k);

function logo(x: number, y: number, k: number): string {
  return (
    `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(40 * k)}" height="${n2(28 * k)}" rx="${n2(5 * k)}" fill="${RED}"/>` +
    `<text x="${n2(x + 20 * k)}" y="${n2(y + 19.5 * k)}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${n2(16 * k)}" fill="#FFFFFF">F1</text>` +
    `<text x="${n2(x + 52 * k)}" y="${n2(y + 20.5 * k)}" font-family="${FONT}" font-weight="700" font-size="${n2(21 * k)}" letter-spacing="${n2(-0.3 * k)}" fill="${INK}">Points Calculator</text>`
  );
}

/** Top-right: the optional @name, then a dark "Fan since" pill. */
function identity(xEnd: number, y: number, k: number, name: string, since: number | null, minX: number): string {
  let g = '';
  let cx = xEnd;
  if (since) {
    const fs = 17 * k, txt = `Fan since ${since}`, w = textWidth(txt, fs, 700) + 24 * k, h = 32 * k;
    cx -= w;
    g += `<rect x="${n2(cx)}" y="${n2(y - h / 2)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(6 * k)}" fill="${INK}"/><text x="${n2(cx + 12 * k)}" y="${n2(y + fs * 0.36)}" font-family="${FONT}" font-weight="700" font-size="${n2(fs)}" fill="#FFFFFF">${txt}</text>`;
    cx -= 12 * k;
  }
  if (name) {
    const nm = fitText(`@${name}`, cx - minX, 25 * k, 700, 0.7);
    g += `<text x="${n2(cx)}" y="${n2(y + 9 * k)}" text-anchor="end" font-family="${FONT}" font-weight="700" font-size="${n2(nm.size)}" fill="${INK2}">${esc(nm.text)}</text>`;
  }
  return g;
}

/** Valid on a name: letters, digits, _ . - — it is printed, never linked or stored. */
export const cleanName = (raw: string) => raw.replace(/[^\w.-]/g, '').slice(0, 20);

export interface CardOptions {
  /** Printed top-right on Post and Story; never on the link image. */
  name?: string;
  /** Prefix for clip-path ids, unique per card in a document. */
  idPrefix?: string;
  /** Page-only: slot handles, numbered empty slots, the drag highlight. */
  interactive?: boolean;
  /** Page-only: the empty slot the next pick lands in. */
  targetSlot?: number;
  /** Page-only: outline these slots in gold ("also in your 9"). */
  matches?: boolean[];
  /** Page-only: faint tiles to keep, in slots that are empty. */
  ghosts?: Array<TileView | null>;
  /** Page-only: label for a tile's handle. */
  slotLabel?: (t: TileView, i: number) => string;
  /** Page-only: hover tooltip on a filled tile. */
  slotTitle?: string;
}

export interface CardRender {
  W: number;
  H: number;
  /** The SVG's inner markup. */
  body: string;
  /** Where each of the nine slots is, in card units. */
  slots: Array<{ x: number; y: number; s: number }>;
}

/** The whole card, in one of three sizes. */
export function card(tiles: ReadonlyArray<TileView | null>, format: CardFormat, o: CardOptions = {}): CardRender {
  const { W, H } = CARD_SIZE[format];
  const ids = `k${o.idPrefix ?? ''}`;
  const sel = tiles.filter((t): t is TileView => !!t);
  const facts = cardFacts(tiles);
  const used = stickersUsed(tiles);
  const name = format === 'link' ? '' : cleanName(o.name ?? '');
  let g = `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
  let gx: number, gy: number, s: number, gap: number;

  if (format === 'link') {
    s = 180; gap = 9; gx = 36; gy = (H - 3 * s - 2 * gap) / 2;
    const px = gx + 3 * s + 2 * gap + 22, rx = px + 22, rEnd = W - 44;
    g += `<rect x="${px}" y="0" width="${W - px}" height="${H}" fill="#F7F8F9"/><rect x="${px}" y="0" width="2" height="${H}" fill="${BORDER}"/>`;
    g += logo(rx, 44, 1);
    g += `<text x="${rx}" y="168" font-family="${FONT}" font-weight="800" font-size="78" letter-spacing="-2" fill="${INK}">My 9 Races</text>`;
    g += identity(rEnd, 216, 1, '', facts.fanSince, rx);
    g += ruler(rx, rEnd, 318, sel, 1);
    g += pills(rx, 398, facts, 0.9, ids);
    g += stickerKey(used, rx, 436, rEnd - rx, 0.9, 'left').svg;
    g += `<text x="${rx}" y="556" font-family="${FONT}" font-weight="700" font-size="22" fill="${INK}">Make yours →</text>`;
    g += `<text x="${rx}" y="586" font-family="${FONT}" font-weight="500" font-size="19" fill="${MUTED}">${SITE}</text>`;
  } else {
    const story = format === 'story', M = 72, k = story ? 1.15 : 1;
    gap = 14; s = (W - 2 * M - 2 * gap) / 3;
    const top = story ? 236 : 60;
    const lk = story ? 1.2 : 1.1;
    g += logo(M, top, lk);
    g += identity(W - M, top + 15 * k, k, name, facts.fanSince, M + logoWidth(lk) + 28);
    const tY = top + (story ? 150 : 128), ts = story ? 108 : 92;
    g += `<text x="${M - 4}" y="${tY}" font-family="${FONT}" font-weight="800" font-size="${ts}" letter-spacing="${n2(-ts * 0.025)}" fill="${INK}">My 9 Races</text>`;
    if (!story) {
      // Post: the key sits beside the title, in the space it leaves, centred
      // on its capitals.
      const kx = M - 4 + textWidth('My 9 Races', ts, 800, -ts * 0.025) + 40;
      const key = stickerKey(used, kx, 0, W - M - kx, 1, 'right');
      g += `<g transform="translate(0 ${n2(tY - ts * 0.36 - key.h / 2)})">${key.svg}</g>`;
    }
    gx = M; gy = tY + (story ? 44 : 38);
    const gEnd = gy + 3 * s + 2 * gap, rY = gEnd + (story ? 80 : 70);
    g += ruler(M, W - M, rY, sel, k);
    if (story) {
      g += pills(M, rY + 86, facts, k, ids);
      // Story: the key under the pills; the call to action moves down to make room.
      const key = stickerKey(used, M, rY + 138, W - 2 * M, k, 'left');
      g += key.svg;
      const cta = rY + 190 + (key.h ? key.h + 24 : 0);
      g += `<text x="${M}" y="${cta}" font-family="${FONT}" font-weight="800" font-size="60" letter-spacing="-1.2" fill="${INK}">Make yours →</text>`;
      g += `<text x="${M}" y="${cta + 42}" font-family="${FONT}" font-weight="500" font-size="28" fill="${MUTED}">${SITE}</text>`;
    } else {
      g += pills(M, H - 58, facts, 1, ids);
      g += `<text x="${W - M}" y="${H - 64}" text-anchor="end" font-family="${FONT}" font-weight="700" font-size="21" fill="${INK}">Make yours →</text>`;
      g += `<text x="${W - M}" y="${H - 36}" text-anchor="end" font-family="${FONT}" font-weight="500" font-size="18" fill="${MUTED}">${SITE}</text>`;
    }
  }

  const slots: CardRender['slots'] = [];
  for (let i = 0; i < 9; i++) {
    const x = gx + (i % 3) * (s + gap), y = gy + Math.floor(i / 3) * (s + gap);
    slots.push({ x, y, s });
    const t = tiles[i];
    if (t) {
      const attrs = o.interactive
        ? `data-slot="${i}" tabindex="0" role="button" aria-label="${esc(o.slotLabel ? o.slotLabel(t, i) : `${t.year} ${t.gp}, ${t.name}`)}"`
        : undefined;
      g += tile(t, x, y, s, { id: `${ids}t${i}`, attrs, title: o.interactive ? o.slotTitle : undefined });
      if (o.matches?.[i]) {
        g += `<rect x="${n2(x - 5)}" y="${n2(y - 5)}" width="${n2(s + 10)}" height="${n2(s + 10)}" rx="${n2(s * 0.06)}" fill="none" stroke="${GOLD}" stroke-width="7" pointer-events="none"/>`;
      }
    } else if (o.interactive) {
      g += emptySlot(i, x, y, s, i === o.targetSlot, o.ghosts?.[i] ?? null, `${ids}g${i}`);
    }
  }
  if (o.interactive) {
    g += `<rect data-hl x="0" y="0" width="0" height="0" rx="${n2(s * 0.05)}" fill="none" stroke="${BLUE}" stroke-width="${n2(s * 0.025)}" visibility="hidden" pointer-events="none"/>`;
  }
  return { W, H, body: g, slots };
}

function emptySlot(i: number, x: number, y: number, s: number, target: boolean, ghost: TileView | null, id: string): string {
  let g = `<g transform="translate(${n2(x)} ${n2(y)})" data-slot="${i}"${ghost ? ' data-ghost="1"' : ''} tabindex="0" role="button" aria-label="${ghost ? esc(`Keep ${ghost.year} ${ghost.gp}, ${ghost.name}`) : `Empty slot ${i + 1}: add a race`}"><title>${ghost ? 'Keep this race' : 'Add a race'}</title>`;
  g += `<rect x="${n2(s * 0.004)}" y="${n2(s * 0.004)}" width="${n2(s * 0.992)}" height="${n2(s * 0.992)}" rx="${n2(s * 0.045)}" fill="${target ? '#EEF3FE' : '#F7F8F9'}" stroke="${target ? BLUE : '#C9CED4'}" stroke-width="${n2(s * 0.006)}" stroke-dasharray="${n2(s * 0.03)} ${n2(s * 0.022)}"/>`;
  if (ghost) {
    g += `<g opacity=".32">${tile(ghost, 0, 0, s, { id })}</g>`;
    g += `<circle cx="${n2(s / 2)}" cy="${n2(s * 0.42)}" r="${n2(s * 0.12)}" fill="#FFFFFF" stroke="${BLUE}" stroke-width="${n2(s * 0.008)}"/><path d="M${n2(s / 2)} ${n2(s * 0.36)}v${n2(s * 0.12)}M${n2(s * 0.44)} ${n2(s * 0.42)}h${n2(s * 0.12)}" stroke="${BLUE}" stroke-width="${n2(s * 0.016)}" stroke-linecap="round"/>`;
  } else {
    // A plus, not a number: an empty slot is somewhere to add, not a rank.
    const c = target ? BLUE : '#9AA3AC', a = s * 0.09;
    g += `<path d="M${n2(s / 2)} ${n2(s / 2 - a)}v${n2(2 * a)}M${n2(s / 2 - a)} ${n2(s / 2)}h${n2(2 * a)}" stroke="${c}" stroke-width="${n2(s * 0.022)}" stroke-linecap="round"/>`;
  }
  return g + '</g>';
}

/** A standalone SVG document, for the PNG renderer and downloads. */
export function cardDocument(r: CardRender): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r.W}" height="${r.H}" viewBox="0 0 ${r.W} ${r.H}">${r.body}</svg>`;
}
