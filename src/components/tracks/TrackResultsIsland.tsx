import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';
import PaywallOverlay from '../common/PaywallOverlay';
import TeamColorStripe from '../common/TeamColorStripe';
import HorizontalScrollBar from '../common/HorizontalScrollBar';
import { API_BASE_URL } from '../../utils/constants';
import type { CircuitEdition, CircuitHistory, PodiumEntry } from '../../types/track';

interface Props {
  circuitId: string;
  initialEditions: CircuitEdition[];
  /** id of the server-rendered static table to hide once this island mounts. */
  staticContainerId: string;
}

// Match the calculator grid's dimensions exactly.
const POS_COL = 64;
const COL_WIDTH = 120;
const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 60;
const GAP = 6;

// Read-only twin of <DriverCard> (which is Redux/DnD-coupled): same flat card,
// left team stripe, UPPERCASE last name + team beneath — exactly the grid cards.
const TrackDriverCard: React.FC<{ entry?: PodiumEntry }> = ({ entry }) => {
  if (!entry) return <div className="race-slot h-full w-full" aria-hidden="true" />;
  const team = { color: entry.teamColor, secondaryColor: entry.teamSecondaryColor };
  return (
    <div className="grid-card-wrapper">
      <div className="driver-card h-full" style={{ paddingLeft: '10px', cursor: 'default' }}>
        <TeamColorStripe team={team} widthPx={4} />
        <div className="flex flex-col ml-1 flex-grow min-w-0">
          <span className="text-xs font-bold truncate">{entry.driverLast.toUpperCase()}</span>
          <span className="text-2xs text-ink-muted leading-tight truncate">{entry.teamName}</span>
        </div>
      </div>
    </div>
  );
};

const TrackResultsEnhancer: React.FC<Props> = ({ circuitId, initialEditions, staticContainerId }) => {
  useAuth(); // bootstraps the Better-Auth session into Redux for the paywall
  const [editions, setEditions] = useState<CircuitEdition[]>(initialEditions);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const staticEl = document.getElementById(staticContainerId);
    if (staticEl) staticEl.style.display = 'none';

    let cancelled = false;
    // no-store: this refetch exists to get fresh data (unlock premium for
    // subscribers + newest race), so it should bypass the browser HTTP cache.
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/circuit?circuitId=${circuitId}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as CircuitHistory;
        if (data.editions?.length) setEditions(data.editions);
      } catch {
        /* keep build-time editions */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [circuitId, staticContainerId]);

  const resultAt = (e: CircuitEdition, pos: number) => e.results?.find((p) => p.position === pos);

  // Columns newest-first (most recent year on the LEFT). Rows = finishing
  // positions 1..maxPos. (Track pages only — the landing-page calculator grid is
  // a separate component and keeps its own ordering.)
  const cols = [...editions].sort((a, b) => b.season - a.season);
  const maxPos = Math.max(1, ...cols.flatMap((e) => (e.results ?? []).map((p) => p.position)));
  const positions = Array.from({ length: maxPos }, (_, i) => i + 1);

  return (
    <div className="bg-surface shadow-xs rounded-lg border flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-3 pt-2 pb-1 border-b">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-display font-semibold text-ink">Finishing order by season</span>
          <span className="text-2xs text-ink-muted">Each column is a year · drag the bar to scroll</span>
        </div>
        <HorizontalScrollBar scrollContainerRef={scrollRef} />
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto p-2">
        <div
          className="grid"
          style={{
            gap: GAP,
            gridTemplateColumns: `${POS_COL}px repeat(${cols.length}, ${COL_WIDTH}px)`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${maxPos}, ${ROW_HEIGHT}px)`,
            width: 'max-content',
          }}
        >
          {/* Corner (sticky both axes) */}
          <div
            className="position-header flex items-center justify-center text-2xs"
            style={{ gridColumn: 1, gridRow: 1, position: 'sticky', top: 0, left: 0, zIndex: 4 }}
          >
            POS
          </div>

          {/* Year headers (sticky top) */}
          {cols.map((e, ci) => (
            <div
              key={`h-${e.season}-${e.raceId}`}
              className="race-header"
              style={{ gridColumn: ci + 2, gridRow: 1, position: 'sticky', top: 0, zIndex: 2 }}
            >
              <span className="text-sm leading-none font-semibold">{e.season}</span>
              {e.locked && <span className="text-2xs text-ink-muted mt-0.5">🔒 Archive</span>}
            </div>
          ))}

          {/* Position labels (sticky left); podium positions get the dark style */}
          {positions.map((pos) => (
            <div
              key={`p-${pos}`}
              className={`position ${pos <= 3 ? 'position-podium' : ''}`}
              style={{ gridColumn: 1, gridRow: pos + 1, position: 'sticky', left: 0, zIndex: 1 }}
            >
              {pos}
            </div>
          ))}

          {/* Cells — one tall locked block per premium year, else a card per row */}
          {cols.map((e, ci) =>
            e.locked ? (
              <button
                key={`lock-${e.season}-${e.raceId}`}
                type="button"
                onClick={() => setShowPaywall(true)}
                className="race-slot !border-solid !border-strong bg-surface-sunken text-ink-muted hover:text-ink hover:bg-carbon-100 transition-colors !items-start !justify-start"
                style={{ gridColumn: ci + 2, gridRow: `2 / span ${maxPos}` }}
                aria-label={`Unlock the ${e.season} archive season`}
              >
                {/* Pinned so the lock stays visible while scrolling the tall column */}
                <span
                  className="flex flex-col items-center gap-1 w-full py-3"
                  style={{ position: 'sticky', top: 8 }}
                >
                  <span className="text-xl">🔒</span>
                  <span className="text-2xs font-semibold text-brand">Unlock</span>
                </span>
              </button>
            ) : (
              positions.map((pos) => (
                <div key={`c-${e.season}-${e.raceId}-${pos}`} style={{ gridColumn: ci + 2, gridRow: pos + 1 }}>
                  <TrackDriverCard entry={resultAt(e, pos)} />
                </div>
              ))
            )
          )}
        </div>
      </div>

      {showPaywall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="relative w-full max-w-md h-[560px] bg-surface rounded-xl overflow-hidden shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPaywall(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-surface/80 hover:bg-surface text-ink-secondary flex items-center justify-center"
            >
              ✕
            </button>
            <PaywallOverlay />
          </div>
        </div>
      )}

      <AuthModal />
    </div>
  );
};

export default function TrackResultsIsland(props: Props) {
  return (
    <Provider store={store}>
      <TrackResultsEnhancer {...props} />
    </Provider>
  );
}
