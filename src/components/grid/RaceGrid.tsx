import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RootState } from '../../store';
import PositionColumn from './PositionColumn';
import RaceColumn from './RaceColumn';
import GridToolbar from './GridToolbar';
import useWindowSize from '../../hooks/useWindowSize';
import { togglePositionColumnMode } from '../../store/slices/uiSlice';
import { selectDriverStandings } from '../../store/selectors/resultsSelectors';
import { useAppDispatch } from '../../store';
import { getActiveSeason, getGridPositions } from '../../utils/constants';

interface RaceGridProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  showOfficialResults: boolean;
}

const POSITION_COLUMN_WIDTH = 80;
const HEADER_HEIGHT = 64;
const ROW_HEIGHT = 72;
const GAP = 8;
const OVERSCAN = 2;

const RaceGrid: React.FC<RaceGridProps> = ({
  scrollRef,
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  showOfficialResults,
}) => {
  const dispatch = useAppDispatch();
  const races = useSelector((state: RootState) => state.seasonData.races);
  const positionColumnMode = useSelector((state: RootState) => state.ui.positionColumnMode);
  const driverStandings = useSelector(selectDriverStandings);
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

    const scrollTimeout = setTimeout(() => {
      columnVirtualizer.scrollToIndex(
        Math.max(0, firstUpcomingRaceIndex - 1),
        { behavior: 'smooth', align: 'start' }
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

  return (
    <div className="shadow-md rounded-lg border border-gray-200">
      <GridToolbar
        onReset={onReset}
        onToggleOfficialResults={onToggleOfficialResults}
        onOpenHistory={onOpenHistory}
        onOpenExport={onOpenExport}
        showOfficialResults={showOfficialResults}
      />

      <div
        ref={actualScrollRef}
        id="race-grid"
        className="overflow-x-auto p-4"
        style={{ maxHeight: `calc(100vh - 180px)` }}
      >
        <div
          style={{
            width: POSITION_COLUMN_WIDTH + GAP + totalVirtualWidth,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', marginBottom: GAP, height: HEADER_HEIGHT }}>
            <div
              className="position-header cursor-pointer hover:bg-gray-800 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 group sticky left-0 z-20"
              onClick={() => dispatch(togglePositionColumnMode())}
              title={`Click to switch to ${positionColumnMode === 'position' ? 'championship standings' : 'grid positions'} view`}
              style={{
                width: POSITION_COLUMN_WIDTH,
                height: HEADER_HEIGHT,
                flexShrink: 0,
              }}
            >
              <span className="text-[11px] font-bold">
                {positionColumnMode === 'position' ? 'Grid' : 'Driver'}
              </span>
              <span className="text-[9px] opacity-80">
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
                return (
                  <div
                    key={race.id}
                    className={`race-header ${race.isSprint ? 'sprint' : ''} ${race.completed ? 'completed-race-header' : ''}`}
                    style={{
                      position: 'absolute',
                      left: virtualColumn.start,
                      top: 0,
                      width: columnWidth - GAP,
                      height: HEADER_HEIGHT,
                    }}
                  >
                    {race.countryCode && (
                      <img
                        src={`/flags/${race.countryCode}.webp`}
                        alt={race.country}
                        className="flag"
                      />
                    )}
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {race.name
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                    {race.completed && (
                      <span className="completed-indicator" title="Completed Race">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {Array.from({ length: getGridPositions(getActiveSeason()) }, (_, i) => i + 1).map(position => {
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
