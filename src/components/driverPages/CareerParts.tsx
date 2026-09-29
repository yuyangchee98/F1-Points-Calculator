import React from 'react';
import { fmtPoints, ordinal } from '../../utils/drivers';
import type { CareerCurrent, CareerSeason } from '../../types/driver';

// Rendered twice: statically by pages/drivers/[driver].astro (links, for
// crawlers and no-JS) and by DriverCareerIsland (buttons), so the swap from
// one to the other does not shift a pixel.

// ---------------------------------------------------------------------------
// Championship finish by season: one bar per season, taller = better, filled
// with the season's main team colour. Title years get a gold cap.
// ---------------------------------------------------------------------------

const COL = 48; // viewBox units per season
const LEFT = 34; // room for the P-labels
const TOP = 22; // room for the number above a P1 bar
const PLOT = 170;
const BOTTOM = 28; // year labels
const TICK_CANDIDATES = [1, 3, 5, 10, 15, 20, 25, 30, 35, 40];
const MIN_TICK_GAP = 18;

interface ChartProps {
  seasons: CareerSeason[];
  selected?: number;
  /** Island mode: seasons are buttons. */
  onSelect?: (season: number) => void;
  /** Static mode: seasons link out. */
  hrefFor?: (season: number) => string;
}

export const SeasonChart: React.FC<ChartProps> = ({ seasons, selected, onSelect, hrefFor }) => {
  const maxPos = Math.max(8, ...seasons.map((s) => s.position ?? 0));
  const W = LEFT + seasons.length * COL + 4;
  const H = TOP + PLOT + BOTTOM;
  const base = TOP + PLOT;
  const barH = (pos: number) => ((maxPos + 1 - pos) / maxPos) * PLOT;

  // Ticks the scale actually reaches, thinned so labels never collide.
  const ticks: number[] = [];
  for (const p of [...TICK_CANDIDATES.filter((p) => p < maxPos), maxPos]) {
    const last = ticks[ticks.length - 1];
    if (last == null || barH(last) - barH(p) >= MIN_TICK_GAP) ticks.push(p);
  }

  return (
    <svg
      className="dp-chart"
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: W, minWidth: Math.min(W, Math.max(560, seasons.length * 28)) }}
      role="group"
      aria-label="Seasons"
    >
      {ticks.map((p) => (
        <g key={p}>
          <line className="grid" x1={LEFT} x2={W} y1={base - barH(p)} y2={base - barH(p)} />
          <text className="axis" x={LEFT - 8} y={base - barH(p) + 4} textAnchor="end">
            P{p}
          </text>
        </g>
      ))}
      <line className="floor" x1={LEFT} x2={W} y1={base} y2={base} />

      {seasons.map((s, i) => {
        const cx = LEFT + COL * i + COL / 2;
        const pos = s.position;
        const h = pos != null ? barH(pos) : 0;
        const champ = pos === 1;
        const label = `${s.season}: ${s.excluded ? 'excluded from the standings' : pos ? ordinal(pos) : 'not classified'}${
          s.teams[0] ? `, ${s.teams[0].name}` : ''
        }${s.locked ? ', archive season' : ''}`;
        const body = (
          <>
            <rect className="hit" x={cx - COL / 2 + 1} y={2} width={COL - 2} height={H - 4} rx={5} />
            {pos != null && (
              <rect
                className="bar"
                x={cx - 14}
                y={base - h}
                width={28}
                height={h}
                rx={3}
                style={{ fill: s.teams[0]?.color || '#9AA3AC' }}
              />
            )}
            {champ && <rect className="cap" x={cx - 14} y={base - h} width={28} height={5} rx={2} />}
            <text className={`num${champ ? ' ch' : ''}`} x={cx} y={base - h - 6} textAnchor="middle">
              {s.excluded ? 'DSQ' : pos ?? '–'}
            </text>
            <text className="yr" x={cx} y={H - 9} textAnchor="middle">{`'${String(s.season).slice(2)}`}</text>
          </>
        );
        const cls = `col${s.season === selected ? ' sel' : ''}`;
        if (onSelect) {
          return (
            <g
              key={s.season}
              className={cls}
              role="button"
              tabIndex={0}
              aria-label={label}
              aria-pressed={s.season === selected}
              onClick={() => onSelect(s.season)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(s.season);
                }
              }}
            >
              {body}
            </g>
          );
        }
        return (
          <a key={s.season} className={cls} href={hrefFor?.(s.season)} aria-label={label}>
            {body}
          </a>
        );
      })}
    </svg>
  );
};

/** Legend: the teams the chart uses, in career order, plus the title cap. */
export const ChartLegend: React.FC<{ seasons: CareerSeason[] }> = ({ seasons }) => {
  const teams = new Map<string, string>();
  for (const s of seasons) if (s.teams[0] && !teams.has(s.teams[0].name)) teams.set(s.teams[0].name, s.teams[0].color || '#9AA3AC');
  const champ = seasons.some((s) => s.position === 1);
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[12.5px] text-ink-secondary">
      {[...teams].map(([name, color]) => (
        <span key={name} className="inline-flex items-center gap-1.5">
          <i className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
          {name}
        </span>
      ))}
      {champ && (
        <span className="inline-flex items-center gap-1.5">
          <i className="w-2.5 h-2.5 rounded-sm bg-gold" />
          World Champion
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// This season, as one line under the career stats.
// ---------------------------------------------------------------------------

const posClass = (pos: number, pts: number) =>
  pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : pts > 0 ? 'pts' : '';

export const ThisSeason: React.FC<{ current: CareerCurrent; line: string | null }> = ({ current, line }) => (
  <section
    className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] border bg-surface-sunken px-4 py-3 text-sm"
    aria-label="This season"
  >
    <span className="dp-live-dot" aria-hidden="true" />
    <span className="whitespace-nowrap">
      <strong className="font-display font-extrabold">
        {current.season} · {current.position ? ordinal(current.position) : '–'}
      </strong>{' '}
      with {fmtPoints(current.points)} pts
    </span>
    {line && <span className="text-ink-secondary flex-[1_1_260px]">{line}</span>}
    {current.recent.length > 0 && (
      <span className="flex gap-1" aria-label={`Last ${current.recent.length} races`}>
        {current.recent.map((r, i) => (
          <span key={i} title={`${r.name}: ${ordinal(r.pos)}`} className={`dp-pos ${posClass(r.pos, r.pts)}`}>
            P{r.pos}
          </span>
        ))}
      </span>
    )}
    <a href="/" className="font-semibold text-interactive hover:underline whitespace-nowrap">
      Open {current.season} in the calculator →
    </a>
  </section>
);
