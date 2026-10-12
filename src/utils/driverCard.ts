/**
 * A driver's career as a 9:16 story image, drawn on a canvas in the browser.
 *
 * Pictures over captions: titles are trophies, a rank is a small all-time board
 * with the driver's row lit, and wins or podiums are a grid of every start with
 * the good ones filled. One stat leads (the one whose share button was tapped),
 * the rest sit in a row underneath.
 *
 * Drawn and encoded synchronously, so the share sheet opens inside the tap's
 * user activation (iOS Safari refuses a share that follows an await). Canvas text
 * uses the page's fonts, and Archivo is loaded by the time anyone taps.
 */

export interface BoardRow {
  rank: number;
  code: string;
  value: number;
  me: boolean;
  /** Rows are skipped above this one (the driver, outside the top three). */
  gap?: boolean;
}

export interface CardStat {
  k: string;
  /** Short label for the image ("Points", not "Career points"). */
  short: string;
  v: string;
  gold?: boolean;
  /** Titles: drawn as this many trophies. */
  trophies?: number;
  /** All-time top three, plus this driver's row when outside it. */
  board?: BoardRow[];
  /** Wins or podiums out of every start. */
  grid?: { filled: number; total: number };
}

export interface DriverCardData {
  givenName: string;
  familyName: string;
  meta: string;
  teamColor?: string;
  teamSecondaryColor?: string;
  stats: CardStat[];
  path: string;
}

export interface CurrentSeason {
  season: number;
  position: number | null;
  points: string;
}

const W = 1080;
const H = 1920;
const PAD = 96;
const INNER = W - PAD * 2;
const INK = '#15181C';
const INK2 = '#4F5760';
const MUTED = '#6E7780';
const BORDER = '#DFE3E6';
const EMPTY = '#EEF0F2';
const GOLD = '#C4920A';
const BRONZE = '#A0662E';
const RED = '#E10600';
const SUCCESS = '#0E8A4D';
const FONT = "Archivo, 'Archivo-fallback', system-ui, sans-serif";
const SITE = 'f1pointscalculator.chyuang.com';

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
const num = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function fit(ctx: Ctx, text: string, weight: number, max: number, width: number): number {
  let size = max;
  for (; size > 20; size -= 2) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= width) break;
  }
  return size;
}

function text(ctx: Ctx, str: string, x: number, y: number, size: number, weight: number, color: string, tracking = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
  ctx.fillText(str, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A trophy `s` px tall with its top-left at (x, y). */
function trophy(ctx: Ctx, x: number, y: number, s: number, color = GOLD) {
  const k = s / 16;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  const p = new Path2D('M4 1.5h8v4a4 4 0 0 1-8 0zM4 3H1.8v1.2A2.3 2.3 0 0 0 4 6.5M12 3h2.2v1.2A2.3 2.3 0 0 1 12 6.5M8 9.5v3M5.2 14.5h5.6l-.6-2H5.8z');
  ctx.fill(p);
  ctx.stroke(p);
  ctx.restore();
}

/** `n` trophies in a row inside `width`, at most `max` px each. Returns the height used. */
function trophies(ctx: Ctx, n: number, x: number, y: number, width: number, max: number): number {
  const s = Math.min(max, (width + max * 0.15) / (n * 1.15));
  for (let i = 0; i < n; i++) trophy(ctx, x + i * s * 1.15, y, s);
  return s;
}

/** Every start as a square, the `filled` ones in `color`. Returns the height used. */
function startsGrid(ctx: Ctx, filled: number, total: number, x: number, y: number, width: number, maxH: number, color: string): number {
  let s = 40;
  let gap = 10;
  let cols = 0;
  let rows = 0;
  for (; s >= 6; s -= 1) {
    gap = Math.max(2, Math.round(s * 0.25));
    cols = Math.floor((width + gap) / (s + gap));
    rows = Math.ceil(total / cols);
    if (rows * (s + gap) - gap <= maxH) break;
  }
  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i < filled ? color : EMPTY;
    roundRect(ctx, x + (i % cols) * (s + gap), y + Math.floor(i / cols) * (s + gap), s, s, Math.max(1, s * 0.18));
    ctx.fill();
  }
  return rows * (s + gap) - gap;
}

const BOARD_ROW = 58;
const boardHeight = (rows: BoardRow[]) =>
  rows.length * BOARD_ROW + rows.filter((r) => r.gap).length * 14;

/** The all-time board: rank, code, a bar to scale, the value. Returns the height used. */
function board(ctx: Ctx, rows: BoardRow[], x: number, y: number, accent: string): number {
  const top = Math.max(...rows.map((r) => r.value));
  const barX = x + 190;
  const barMax = INNER - 190 - 170;
  let cy = y;
  rows.forEach((r) => {
    // A gap in the ranks gets a thin rule rather than a row of dots.
    if (r.gap) {
      ctx.fillStyle = BORDER;
      ctx.fillRect(x, cy - 4, INNER, 3);
      cy += 14;
    }
    const base = cy + 40;
    text(ctx, `${r.rank}`, x, base, 34, 700, r.me ? INK : MUTED);
    text(ctx, r.code, x + 62, base, 38, 800, r.me ? INK : INK2);
    ctx.fillStyle = r.me ? accent : '#D5DAE0';
    roundRect(ctx, barX, cy + 12, Math.max(10, (r.value / top) * barMax), 34, 6);
    ctx.fill();
    text(ctx, num(r.value), barX + Math.max(10, (r.value / top) * barMax) + 18, base, 36, r.me ? 800 : 600, r.me ? INK : INK2);
    cy += BOARD_ROW;
  });
  return cy - y;
}

/** Draws the card for `hero` (an index into data.stats) and returns the canvas. */
export function drawDriverCard(data: DriverCardData, hero: number, current: CurrentSeason | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')! as Ctx;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Team stripe down the left edge, split when the team has two colours.
  const accent = data.teamColor || INK;
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 22, H);
  if (data.teamSecondaryColor) {
    ctx.fillStyle = data.teamSecondaryColor;
    ctx.fillRect(0, H / 2, 22, H / 2);
  }

  // Logo.
  ctx.fillStyle = RED;
  roundRect(ctx, PAD, 104, 84, 58, 10);
  ctx.fill();
  ctx.textAlign = 'center';
  text(ctx, 'F1', PAD + 42, 147, 34, 800, '#FFFFFF');
  ctx.textAlign = 'left';
  text(ctx, 'Points Calculator', PAD + 106, 149, 44, 700, INK, -0.5);

  // Name.
  text(ctx, data.givenName.toUpperCase(), PAD, 300, 46, 700, MUTED, 4);
  const family = data.familyName.toUpperCase();
  const famSize = fit(ctx, family, 800, 150, INNER);
  const famBase = 300 + famSize * 0.95;
  text(ctx, family, PAD, famBase, famSize, 800, INK, -famSize * 0.01);
  text(ctx, data.meta, PAD, famBase + 70, 38, 500, INK2);

  // The lead stat: label, then its picture.
  const lead = data.stats[hero] ?? data.stats[0];
  let y = 700;
  text(ctx, lead.short.toUpperCase(), PAD, y, 42, 700, MUTED, 4);
  y += 34;
  if (lead.trophies) {
    y += trophies(ctx, lead.trophies, PAD, y, INNER, 190) + 40;
  } else {
    const size = fit(ctx, lead.v, 800, 300, INNER);
    text(ctx, lead.v, PAD - size * 0.03, y + size * 0.74, size, 800, lead.gold ? GOLD : INK, -size * 0.02);
    y += size * 0.74 + 48;
  }
  if (lead.grid) {
    // The grid takes what the board leaves above the row of other stats.
    const boardH = lead.board ? boardHeight(lead.board) : 0;
    const room = Math.max(110, Math.min(250, 1470 - y - 48 - boardH));
    y += startsGrid(ctx, lead.grid.filled, lead.grid.total, PAD, y, INNER, room, lead.k === 'Wins' ? GOLD : BRONZE) + 48;
  }
  if (lead.board) board(ctx, lead.board, PAD, y, accent);

  // The other stats, one row of four.
  const others = data.stats.filter((_, i) => i !== hero).slice(0, 4);
  const colW = INNER / others.length;
  const rowTop = 1556;
  ctx.fillStyle = BORDER;
  ctx.fillRect(PAD, rowTop - 50, INNER, 3);
  others.forEach((s, i) => {
    const x = PAD + i * colW;
    if (s.trophies) {
      trophies(ctx, s.trophies, x, rowTop - 2, colW - 24, 58);
    } else {
      const size = fit(ctx, s.v, 800, 64, colW - 24);
      text(ctx, s.v, x, rowTop + 52, size, 800, s.gold ? GOLD : INK, -1);
    }
    text(ctx, s.short.toUpperCase(), x, rowTop + 98, 26, 700, MUTED, 3);
  });

  // This season, while the driver is on the grid.
  if (current) {
    const label = `${current.season} · ${current.position ? ordinal(current.position) : '–'} · ${current.points}`;
    ctx.font = `700 40px ${FONT}`;
    const w = ctx.measureText(label).width + 56;
    ctx.fillStyle = 'rgba(14, 138, 77, 0.1)';
    roundRect(ctx, PAD, 1744, w, 70, 14);
    ctx.fill();
    text(ctx, label, PAD + 28, 1792, 40, 700, SUCCESS);
  }

  ctx.textAlign = 'right';
  text(ctx, `${SITE}${data.path}`.slice(0, 64), W - PAD, current ? H - 72 : H - 92, 30, 500, MUTED);
  ctx.textAlign = 'left';

  return canvas;
}

/** PNG bytes from a canvas, synchronously (toBlob is async). */
export function canvasToFile(canvas: HTMLCanvasElement, name: string): File {
  const dataUrl = canvas.toDataURL('image/png');
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: 'image/png' });
}
