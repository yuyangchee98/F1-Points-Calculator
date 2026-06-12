import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import RaceColumn from './RaceColumn';
import GridToolbar from './GridToolbar';
import useSwipe from '../../hooks/useSwipe';
import { getActiveSeason, getGridPositions } from '../../utils/constants';
import { toggleConsensus, selectDriver } from '../../store/slices/uiSlice';
import { selectLockedPredictions } from '../../store/selectors/lockedPredictionsSelectors';
import { selectTeamsByIdMap, getDriverLastName } from '../../store/selectors/dataSelectors';
import { useAppDispatch } from '../../store';
import { trackEvent, GA_EVENTS } from '../../utils/analytics';

interface MobileRaceCardViewProps {
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  showOfficialResults: boolean;
}

const ROW_HEIGHT = 48;

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const MobileRaceCardView: React.FC<MobileRaceCardViewProps> = ({
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  showOfficialResults,
}) => {
  const dispatch = useAppDispatch();
  const races = useSelector((state: RootState) => state.seasonData.races);
  const drivers = useSelector((state: RootState) => state.seasonData.drivers);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const showConsensus = useSelector((state: RootState) => state.ui.showConsensus);
  const lockedPredictions = useSelector(selectLockedPredictions);
  const teamById = useSelector(selectTeamsByIdMap);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [driverStripExpanded, setDriverStripExpanded] = useState(true);
  const selectedDriverRef = useRef<HTMLButtonElement | null>(null);

  // Initialize to first upcoming race
  useEffect(() => {
    if (races.length === 0) return;
    const firstUpcoming = races.findIndex(r => !r.completed);
    if (firstUpcoming !== -1) {
      setCurrentIndex(firstUpcoming);
    }
  }, [races]);

  // Scroll selected driver chip into view
  useEffect(() => {
    if (selectedDriverRef.current) {
      selectedDriverRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDriverId]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(races.length - 1, i + 1));
  }, [races.length]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
    threshold: 40,
  });

  const handleDriverTap = (driverId: string) => {
    if (selectedDriverId === driverId) {
      dispatch(selectDriver(null));
    } else {
      dispatch(selectDriver(driverId));
    }
  };

  if (races.length === 0) return null;

  const race = races[currentIndex];
  const posCount = getGridPositions(getActiveSeason());
  const lockedPrediction = lockedPredictions[race.id];
  const isLocked = !!lockedPrediction;
  const hasScore = lockedPrediction?.score !== undefined;

  return (
    <div className="flex flex-col h-full bg-surface shadow-xs rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0">
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
      </div>

      {/* Compact race navigation: single row */}
      <div className="shrink-0 flex items-center px-1 bg-surface-sunken border-b">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full text-ink-secondary disabled:text-carbon-300 active:bg-carbon-200 transition-colors shrink-0"
          aria-label="Previous race"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 px-1 overflow-hidden">
          {race.countryCode && (
            <img
              src={`/flags/${race.countryCode}.webp`}
              alt={race.country}
              className="flag !mr-0 shrink-0"
            />
          )}
          <span className="font-display font-bold text-sm text-ink truncate min-w-0">
            {formatName(race.name)}
          </span>
          {race.isSprint && (
            <span className="text-2xs bg-carbon-700 text-white px-1 py-px rounded-sm font-semibold tracking-wide shrink-0">
              SPRINT
            </span>
          )}
          {hasScore ? (
            <span className="text-2xs bg-carbon-100 text-ink-secondary px-1 py-px rounded-sm font-semibold tnum shrink-0">
              {lockedPrediction.score?.percentage}%
            </span>
          ) : isLocked ? (
            <svg className="w-3 h-3 text-ink-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Prediction locked">
              <title>Prediction locked</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : race.completed ? (
            <span className="text-2xs bg-green-50 text-success px-1 py-px rounded-sm font-semibold shrink-0">✓</span>
          ) : null}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === races.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-full text-ink-secondary disabled:text-carbon-300 active:bg-carbon-200 transition-colors shrink-0"
          aria-label="Next race"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Driver grid — expandable, default open, wraps so all drivers are visible at once */}
      <div className="shrink-0 border-b bg-surface">
        <button
          onClick={() => setDriverStripExpanded(!driverStripExpanded)}
          className="w-full flex items-center justify-between px-2.5 py-1 text-2xs font-semibold text-ink-secondary active:bg-carbon-50"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            {selectedDriverId ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-interactive animate-pulse shrink-0" />
                <span className="text-interactive truncate">
                  {getDriverLastName(selectedDriverId)} — tap a slot
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(selectDriver(null));
                  }}
                  className="ml-1 text-ink-muted hover:text-ink bg-carbon-100 rounded-full w-4 h-4 flex items-center justify-center text-2xs leading-none shrink-0"
                  aria-label="Cancel selection"
                >
                  x
                </button>
              </>
            ) : (
              <span className="tracking-wider">SELECT DRIVER</span>
            )}
          </span>
          <svg
            className={`w-3 h-3 text-ink-muted transition-transform duration-200 shrink-0 ${driverStripExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            driverStripExpanded ? 'max-h-60' : 'max-h-0'
          }`}
        >
          <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
            {drivers.map(driver => {
              const team = teamById[driver.team];
              const isSelected = selectedDriverId === driver.id;
              return (
                <button
                  key={driver.id}
                  ref={isSelected ? selectedDriverRef : undefined}
                  onClick={() => handleDriverTap(driver.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-50 ring-2 ring-interactive text-interactive shadow-xs'
                      : 'bg-carbon-100 text-ink-secondary active:bg-carbon-200'
                  }`}
                  style={{ borderLeft: `3px solid ${team?.color || '#ccc'}` }}
                >
                  {getDriverLastName(driver.id)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Swipeable card body */}
      <div
        {...swipeHandlers}
        className="flex-1 min-h-0 overflow-y-auto p-2"
        key={race.id}
      >
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {Array.from({ length: posCount }, (_, i) => i + 1).map(position => (
            <div key={position} className="flex items-center gap-1.5">
              <div
                className={`w-8 shrink-0 text-center text-xs font-display font-bold rounded-sm py-0.5 tnum ${
                  position <= 3
                    ? 'bg-carbon-900 text-white'
                    : position <= 10
                    ? 'bg-carbon-200 text-carbon-700'
                    : 'bg-carbon-100 text-ink-muted'
                }`}
              >
                P{position}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden" style={{ height: ROW_HEIGHT }}>
                <RaceColumn
                  race={race}
                  position={position}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileRaceCardView;
