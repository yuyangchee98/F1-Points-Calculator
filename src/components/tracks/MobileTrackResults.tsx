import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSwipe from '../../hooks/useSwipe';
import TrackDriverCard from './TrackDriverCard';
import type { CircuitEdition } from '../../types/track';

interface Props {
  editions: CircuitEdition[];
  country: string;
  /** ISO 3166-1 alpha-2 code already translated for flagcdn (uk -> gb). */
  flagCode: string;
  /** Opens the shared paywall modal owned by the island. */
  onUnlock: () => void;
}

const ROW_HEIGHT = 48;

// Mobile twin of the desktop year-matrix: one season at a time as a swipeable
// card, mirroring the main calculator's <MobileRaceCardView> (prev/next header +
// 2-column P1/P2… grid with dark podium badges). Newest season first.
const MobileTrackResults: React.FC<Props> = ({ editions, country, flagCode, onUnlock }) => {
  // Newest-first, same ordering as the desktop columns.
  const cols = useMemo(() => [...editions].sort((a, b) => b.season - a.season), [editions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedChipRef = useRef<HTMLButtonElement | null>(null);

  // Clamp if the edition list shrinks/grows after a refetch.
  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, cols.length - 1)));
  }, [cols.length]);

  // Keep the active year chip centered in the rail as the season changes.
  useEffect(() => {
    selectedChipRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [currentIndex]);

  const goNewer = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goOlder = () => setCurrentIndex((i) => Math.min(cols.length - 1, i + 1));

  // Swipe left → advance to the next (older) season; swipe right → newer.
  const swipeHandlers = useSwipe({ onSwipeLeft: goOlder, onSwipeRight: goNewer, threshold: 40 });

  if (cols.length === 0) return null;

  const edition = cols[currentIndex];
  const results = edition.results ?? [];
  const positions = Array.from({ length: results.length }, (_, i) => i + 1);
  const resultAt = (pos: number) => results.find((p) => p.position === pos);

  return (
    <div className="flex flex-col h-full bg-surface shadow-xs rounded-lg border overflow-hidden">
      {/* Season navigation — prev / flag + season + name / next */}
      <div className="shrink-0 flex items-center px-1 bg-surface-sunken border-b">
        <button
          onClick={goNewer}
          disabled={currentIndex === 0}
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary disabled:text-carbon-300 active:bg-carbon-200 transition-colors shrink-0"
          aria-label="Newer season"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 px-1 overflow-hidden py-2">
          {flagCode && (
            <img
              src={`https://flagcdn.com/w40/${flagCode}.png`}
              width="24"
              height="18"
              alt={`${country} flag`}
              className="rounded shadow-sm shrink-0"
            />
          )}
          <span className="font-display font-bold text-base text-ink tnum shrink-0">{edition.season}</span>
          <span className="font-display font-semibold text-sm text-ink-secondary truncate min-w-0">
            {edition.name} Grand Prix
          </span>
          {edition.locked && (
            <span className="text-2xs text-ink-muted shrink-0" aria-label="Archive season">🔒</span>
          )}
        </div>

        <button
          onClick={goOlder}
          disabled={currentIndex === cols.length - 1}
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary disabled:text-carbon-300 active:bg-carbon-200 transition-colors shrink-0"
          aria-label="Older season"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Year rail — quick jumps across the 20+ seasons; lock glyph on archives */}
      <div className="shrink-0 border-b bg-surface overflow-x-auto">
        <div className="flex items-center gap-1.5 px-2 py-1.5 w-max">
          {cols.map((e, i) => {
            const active = i === currentIndex;
            return (
              <button
                key={e.raceId}
                ref={active ? selectedChipRef : undefined}
                onClick={() => setCurrentIndex(i)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-display font-bold tnum transition-colors shrink-0 ${
                  active
                    ? 'bg-carbon-900 text-white'
                    : 'bg-carbon-100 text-ink-secondary active:bg-carbon-200'
                }`}
                aria-label={`${e.season} season${e.locked ? ', archive' : ''}`}
                aria-current={active ? 'true' : undefined}
              >
                {e.season}
                {e.locked && <span className="text-2xs opacity-70">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable season body */}
      <div {...swipeHandlers} key={edition.raceId} className="flex-1 min-h-0 overflow-y-auto p-2">
        {edition.locked || results.length === 0 ? (
          <div className="h-full min-h-[12rem] flex flex-col items-center justify-center text-center gap-3 p-6">
            <span className="text-3xl">🔒</span>
            <div>
              <div className="font-display font-semibold text-ink">{edition.season} archive season</div>
              <p className="text-xs text-ink-secondary mt-1 max-w-[16rem]">
                Unlock the archive to view the full {edition.name} Grand Prix classification.
              </p>
            </div>
            <button
              type="button"
              onClick={onUnlock}
              className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Unlock
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {positions.map((pos) => (
              <div key={pos} className="flex items-center gap-1.5">
                <div
                  className={`w-8 shrink-0 text-center text-xs font-display font-bold rounded-sm py-0.5 tnum ${
                    pos <= 3
                      ? 'bg-carbon-900 text-white'
                      : pos <= 10
                      ? 'bg-carbon-200 text-carbon-700'
                      : 'bg-carbon-100 text-ink-muted'
                  }`}
                >
                  P{pos}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden" style={{ height: ROW_HEIGHT }}>
                  <TrackDriverCard entry={resultAt(pos)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTrackResults;
