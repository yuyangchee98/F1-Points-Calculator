import React, { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { raceKey } from '../../utils/my9/code';
import { gpLabel, type TileView } from '../../utils/my9/render';
import type { My9Pick, My9Race } from '../../utils/my9/types';
import type { RaceHit } from '../../utils/my9/client';
import { Tile } from './parts';

const ROW = 60; // 54px row + 6px gap

interface RowProps {
  hit: RaceHit;
  famous: (race: My9Race) => boolean;
  /** raceKey -> slot index, for races already in the grid. */
  picked: Map<string, number>;
  slots: Array<My9Pick | null>;
  view: (p: My9Pick) => TileView | null;
  onPick: (race: My9Race, hero: number) => void;
  onRowPointerDown: (e: React.PointerEvent, key: string, hero: number) => void;
  /** Set by a drag that ended on a slot, so the row's click does not also fire. */
  suppressClick: React.MutableRefObject<boolean>;
}

const Star = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" aria-label="famous" role="img" className="inline-block align-[-1px] ml-1 text-gold">
    <path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
  </svg>
);

/**
 * Search results, virtualised: a broad search ("ferrari") matches hundreds of
 * races, and every row carries a drawn track. A season's list is short and
 * renders its rows directly (see Builder).
 */
const RaceList: React.FC<Omit<RowProps, 'hit'> & { hits: RaceHit[]; resetKey: string }> = ({ hits, resetKey, ...row }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: hits.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW,
    overscan: 8,
  });
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);
  return (
    <div ref={scrollRef} className="my9-list-wrap flex-1 min-h-0 overflow-y-auto">
      <div style={{ height: v.getTotalSize(), position: 'relative' }}>
        {v.getVirtualItems().map((vi) => (
          <div key={vi.key} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ROW, transform: `translateY(${vi.start}px)` }}>
            <RaceRow hit={hits[vi.index]} {...row} />
          </div>
        ))}
      </div>
    </div>
  );
};

/** One race: its tile (in the driver it would add), name, and its slot if picked. */
export const RaceRow: React.FC<RowProps> = ({
  hit,
  famous,
  picked,
  slots,
  view,
  onPick,
  onRowPointerDown,
  suppressClick,
}) => {
  const { race, hero } = hit;
  const key = raceKey(race);
  const at = picked.get(key);
  const t = view((at !== undefined ? slots[at] : null) ?? { y: race.y, r: race.r, d: hero, s: 0 });
  if (!t) return null;
  const on = at !== undefined;
  return (
    <button
      type="button"
      className={`grid grid-cols-[42px_minmax(0,1fr)_28px] gap-2.5 items-center w-full h-[54px] p-[5px] pr-1.5 bg-surface border rounded-md text-left select-none transition-shadow ${
        on ? 'border-transparent ring-2 ring-inset ring-interactive' : 'hover:border-strong hover:shadow-xs'
      }`}
      aria-label={`${race.y} ${gpLabel(race)}, ${t.name}${on ? `, in slot ${at! + 1}` : ''}`}
      onPointerDown={(e) => onRowPointerDown(e, key, t.d)}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onPick(race, t.d);
      }}
    >
      <Tile view={t} id={`r${key}`} mini className="w-[42px] h-[42px]" />
      <span className="min-w-0">
        <b className="block text-[13px] font-bold truncate">
          <span className="tnum">{race.y}</span> {gpLabel(race)}
          {famous(race) && <Star />}
        </b>
        <small className="block text-2xs text-ink-muted truncate">
          {t.name} · {t.team}
          {t.winner ? ' · winner' : ''}
        </small>
      </span>
      <span className={`w-7 h-7 grid place-items-center border rounded-md text-[13px] font-bold ${on ? 'bg-interactive border-interactive text-white' : 'text-ink-muted'}`}>
        {on ? at! + 1 : '+'}
      </span>
    </button>
  );
};

export default RaceList;
