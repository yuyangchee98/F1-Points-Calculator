import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { RootState } from '../../store';
import PositionColumn from './PositionColumn';
import RaceColumn from './RaceColumn';
import GridToolbar from './GridToolbar';
import useWindowSize from '../../hooks/useWindowSize';
import { togglePositionColumnMode, toggleConsensus } from '../../store/slices/uiSlice';
import { selectDriverStandings } from '../../store/selectors/resultsSelectors';
import { selectLockedPredictions } from '../../store/selectors/lockedPredictionsSelectors';
import { useAppDispatch } from '../../store';
import { getActiveSeason, getGridPositions } from '../../utils/constants';
import { trackEvent, GA_EVENTS } from '../../utils/analytics';
import type { Race } from '../../types';

interface RaceGridProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  showOfficialResults: boolean;
  toolbar?: React.ReactNode;
  racesOverride?: Race[];
  gridPositionCount?: number;
}

const POSITION_COLUMN_WIDTH = 64;
const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 60;
const GAP = 6;
const OVERSCAN = 2;

const RaceGrid: React.FC<RaceGridProps> = ({
  scrollRef,
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  showOfficialResults,
  toolbar,
  racesOverride,
  gridPositionCount,
}) => {
  const dispatch = useAppDispatch();
  const allRaces = useSelector((state: RootState) => state.seasonData.races);
  const races = racesOverride || allRaces;
  const positionColumnMode = useSelector((state: RootState) => state.ui.positionColumnMode);
  const showConsensus = useSelector((state: RootState) => state.ui.showConsensus);
  const driverStandings = useSelector(selectDriverStandings);
  const lockedPredictions = useSelector(selectLockedPredictions);
  const { isMobile, isTablet } = useWindowSize();

  const [hasInitiallyRendered, setHasInitiallyRendered] = useState(false);

  const internalScrollRef = useRef<HTMLDivElement>(null);
  const actualScrollRef = scrollRef || internalScrollRef;

  const columnWidth = isMobile ? 100 + GAP : isTablet ? 110 + GAP : 120 + GAP;

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: races.length,
    getScrollElement: () => actualScrollRef.current,
    estimateSize: () => columnWidth,
    overscan: OVERSCAN,
  });

  useEffect(() => {
    if (!actualScrollRef?.current || races.length === 0) return;

    const firstUpcomingRaceIndex = races.findIndex(race => !race.completed);
    if (firstUpcomingRaceIndex === -1) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollTimeout = setTimeout(() => {
      columnVirtualizer.scrollToIndex(
        Math.max(0, firstUpcomingRaceIndex - 1),
        { behavior: prefersReducedMotion ? 'auto' : 'smooth', align: 'start' }
      );
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [races, columnVirtualizer]);

  useEffect(() => {
    const timer = setTimeout(() => setHasInitiallyRendered(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalVirtualWidth = columnVirtualizer.getTotalSize();

  const posCount = gridPositionCount ?? getGridPositions(getActiveSeason());

  const toolbarContent = toolbar !== undefined ? toolbar : (
    <GridToolbar
      onReset={onReset}
      onToggleOfficialResults={onToggleOfficialResults}
      onOpenHistory={onOpenHistory}
      onOpenExport={onOpenExport}
      showOfficialResults={showOfficialResults}
      onToggleConsensus={() => {
        dispatch(toggleConsensus());
        trackEvent(GA_EVENTS.GRID_ACTIONS.TOGGLE_CONSENSUS, 'Grid Actions', !showConsensus ? 'show' : 'hide');
      }}
      showConsensus={showConsensus}
    />
  );

  return (
    <div className="bg-surface shadow-xs rounded-lg border flex flex-col h-full overflow-hidden">
      <div className="shrink-0">{toolbarContent}</div>

      <div
        ref={actualScrollRef}
        id="race-grid"
        className="flex-1 min-h-0 overflow-auto p-2"
      >
        <div
          style={{
            width: POSITION_COLUMN_WIDTH + GAP + totalVirtualWidth,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', marginBottom: GAP, height: HEADER_HEIGHT }}>
            <div
              className="position-header cursor-pointer flex flex-col items-center justify-center gap-0.5 group sticky left-0 z-header"
              onClick={() => dispatch(togglePositionColumnMode())}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dispatch(togglePositionColumnMode()); } }}
              title={`Click to switch to ${positionColumnMode === 'position' ? 'championship standings' : 'grid positions'} view`}
              style={{
                width: POSITION_COLUMN_WIDTH,
                height: HEADER_HEIGHT,
                flexShrink: 0,
              }}
            >
              <span className="text-2xs font-bold uppercase tracking-wide">
                {positionColumnMode === 'position' ? 'Grid' : 'Driver'}
              </span>
              <span className="text-2xs opacity-70">
                {positionColumnMode === 'position' ? 'Position' : 'Standings'}
              </span>
              <svg
                className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>

            <div style={{ width: GAP, flexShrink: 0 }} />

            <div style={{ position: 'relative', width: totalVirtualWidth, height: HEADER_HEIGHT }}>
              {virtualColumns.map(virtualColumn => {
                const race = races[virtualColumn.index];
                const lockedPrediction = lockedPredictions[race.id];
                const isLocked = !!lockedPrediction;
                const hasScore = lockedPrediction?.score !== undefined;

                const headerContent = (
                  <>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} flex items-center justify-center gap-1 min-w-0 max-w-full`}>
                      {race.countryCode && (
                        <img
                          src={`/flags/${race.countryCode}.webp`}
                          alt={race.country}
                          className="flag !mr-0 shrink-0"
                        />
                      )}
                      <span className="line-clamp-2 leading-tight">
                        {race.name
                          .split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </span>
                    </span>
                    {/* Lock/Score badges */}
                    {hasScore ? (
                      <span
                        className="text-2xs bg-carbon-100 text-ink-secondary px-1.5 py-0.5 rounded-sm font-semibold tnum"
                        title={`You scored ${lockedPrediction.score?.percentage}%`}
                      >
                        {lockedPrediction.score?.percentage}%
                      </span>
                    ) : isLocked ? (
                      <svg
                        className="w-3.5 h-3.5 text-ink-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Prediction locked"
                      >
                        <title>Prediction locked</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : race.completed ? (
                      <span className="completed-indicator" title="Completed Race">✓</span>
                    ) : null}
                  </>
                );

                const headerStyle = {
                  position: 'absolute' as const,
                  left: virtualColumn.start,
                  top: 0,
                  width: columnWidth - GAP,
                  height: HEADER_HEIGHT,
                };

                const headerClassName = `race-header ${race.isSprint ? 'sprint' : ''} ${race.completed ? 'completed-race-header' : ''}`;

                return (
                  <div
                    key={race.id}
                    className={headerClassName}
                    style={headerStyle}
                  >
                    {headerContent}
                  </div>
                );
              })}
            </div>
          </div>

          {Array.from({ length: posCount }, (_, i) => i + 1).map(position => {
            const animationClass = !hasInitiallyRendered
              ? `animate-grid-entry grid-row-${Math.min(position, 10)}`
              : '';

            return (
              <div
                key={position}
                className={animationClass}
                style={{
                  display: 'flex',
                  marginBottom: GAP,
                  height: ROW_HEIGHT,
                }}
              >
                <div
                  className="sticky left-0 z-10"
                  style={{
                    width: POSITION_COLUMN_WIDTH,
                    height: ROW_HEIGHT,
                    flexShrink: 0,
                  }}
                >
                  <PositionColumn
                    position={position}
                    mode={positionColumnMode}
                    standings={driverStandings}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>

                <div style={{ width: GAP, flexShrink: 0 }} />

                <div style={{ position: 'relative', width: totalVirtualWidth, height: ROW_HEIGHT }}>
                  {virtualColumns.map(virtualColumn => {
                    const race = races[virtualColumn.index];

                    return (
                      <RaceColumn
                        key={`${race.id}-${position}`}
                        race={race}
                        position={position}
                        style={{
                          position: 'absolute',
                          left: virtualColumn.start,
                          top: 0,
                          width: columnWidth - GAP,
                          height: ROW_HEIGHT,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RaceGrid;
