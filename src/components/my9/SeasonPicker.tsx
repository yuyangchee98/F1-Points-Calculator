import React, { useMemo, useRef } from 'react';

interface Props {
  /** Seasons that have races, oldest first. */
  years: number[];
  value: number;
  onChange: (year: number) => void;
  /** Races per season, for the label. */
  counts: Map<number, number>;
  /** Seasons that already have a tile in the grid: marked with a dot. */
  pickedYears: Set<number>;
}

const Chevron: React.FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
);

/**
 * Pick a season the way a date picker picks a year: arrows to step one season,
 * decade tabs and a ten-year grid to jump. Every target is a plain button, so a
 * mouse, a thumb and a keyboard all work and nothing needs dragging. Inside the
 * grid the arrow keys move between seasons (left/right one, up/down five).
 */
const SeasonPicker: React.FC<Props> = ({ years, value, onChange, counts, pickedYears }) => {
  const covered = useMemo(() => new Set(years), [years]);
  const decades = useMemo(() => [...new Set(years.map((y) => Math.floor(y / 10) * 10))], [years]);
  // The grid always shows the selected season's decade.
  const decade = Math.floor(value / 10) * 10;
  const gridRef = useRef<HTMLDivElement>(null);

  const i = years.indexOf(value);
  const prev = i > 0 ? years[i - 1] : undefined;
  const next = i >= 0 && i < years.length - 1 ? years[i + 1] : undefined;

  // Move the selection and keep keyboard focus on it.
  const go = (y: number | undefined, focus = false) => {
    if (y === undefined || !covered.has(y)) return;
    onChange(y);
    if (focus) requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-year="${y}"]`)?.focus());
  };

  const step = (by: number) => {
    // Up/down move five years; land on the nearest covered season that way.
    let y = value + by;
    while (y >= years[0] && y <= years[years.length - 1] && !covered.has(y)) y += Math.sign(by);
    go(y, true);
  };

  const arrow = 'w-10 h-10 grid place-items-center rounded-md border bg-surface text-ink hover:border-strong disabled:opacity-30 disabled:pointer-events-none';

  // A fragment, not a wrapper: the season bar is sticky, and a sticky element
  // only sticks within its parent — which must be the column the list is in.
  return (
    <>
      <div className="my9-season-bar flex items-center gap-2 py-1.5 bg-surface">
        <button type="button" className={arrow} disabled={prev === undefined} onClick={() => go(prev)} aria-label={prev ? `Previous season, ${prev}` : 'No earlier season'}>
          <Chevron dir="left" />
        </button>
        <div className="flex-1 text-center leading-tight" aria-live="polite">
          <b className="block font-display text-[26px] font-extrabold tnum text-ink">{value}</b>
          <span className="text-2xs text-ink-muted">{counts.get(value) ?? 0} races</span>
        </div>
        <button type="button" className={arrow} disabled={next === undefined} onClick={() => go(next)} aria-label={next ? `Next season, ${next}` : 'No later season'}>
          <Chevron dir="right" />
        </button>
      </div>

      <div className="grid gap-1 mt-2 bg-carbon-100 rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${decades.length}, minmax(0, 1fr))` }} role="group" aria-label="Decade">
        {decades.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={d === decade}
            // A decade tab opens that decade and selects its first season, so
            // the list below always answers the tap.
            onClick={() => go(d === decade ? value : years.find((y) => y >= d))}
            className={`h-8 rounded-md text-xs font-bold tnum ${d === decade ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
          >
            ’{String(d).slice(2)}s
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-5 gap-1.5 mt-1.5 mb-3"
        role="group"
        aria-label={`Seasons in the ${decade}s`}
        onKeyDown={(e) => {
          const by = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5 }[e.key];
          if (!by) return;
          e.preventDefault();
          if (Math.abs(by) === 1) go(by < 0 ? prev : next, true);
          else step(by);
        }}
      >
        {Array.from({ length: 10 }, (_, k) => decade + k).map((y) => {
          const ok = covered.has(y);
          const on = y === value;
          return (
            <button
              key={y}
              type="button"
              data-year={y}
              disabled={!ok}
              aria-pressed={on}
              tabIndex={on ? 0 : -1}
              title={ok ? `${y} · ${counts.get(y)} races` : y < years[0] ? `Seasons before ${years[0]} aren’t covered` : 'Not raced yet'}
              onClick={() => go(y)}
              className={`relative h-10 rounded-md text-sm font-bold tnum transition-colors ${
                on
                  ? 'bg-interactive text-white'
                  : ok
                    ? 'bg-surface border text-ink hover:border-interactive hover:text-interactive'
                    : 'bg-carbon-50 text-carbon-300 cursor-not-allowed'
              }`}
            >
              {y}
              {pickedYears.has(y) && (
                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${on ? 'bg-white' : 'bg-interactive'}`} aria-label="in your 9" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default SeasonPicker;
