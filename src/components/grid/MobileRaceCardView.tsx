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

interface MobileRaceCardViewProps {
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  showOfficialResults: boolean;
  hasConsensusAccess: boolean;
  onOpenSubscriptionModal: () => void;
}

const ROW_HEIGHT = 56;

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const MobileRaceCardView: React.FC<MobileRaceCardViewProps> = ({
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  showOfficialResults,
  hasConsensusAccess,
  onOpenSubscriptionModal,
}) => {
  const dispatch = useAppDispatch();
  const races = useSelector((state: RootState) => state.seasonData.races);
  const drivers = useSelector((state: RootState) => state.seasonData.drivers);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const showConsensus = useSelector((state: RootState) => state.ui.showConsensus);
  const lockedPredictions = useSelector(selectLockedPredictions);
  const teamById = useSelector(selectTeamsByIdMap);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [driverStripExpanded, setDriverStripExpanded] = useState(false);
  const dotContainerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedDriverRef = useRef<HTMLButtonElement | null>(null);

  // Initialize to first upcoming race
  useEffect(() => {
    if (races.length === 0) return;
    const firstUpcoming = races.findIndex(r => !r.completed);
    if (firstUpcoming !== -1) {
      setCurrentIndex(firstUpcoming);
    }
  }, [races]);

  // Scroll active dot into view
  useEffect(() => {
    const dot = dotRefs.current[currentIndex];
    if (dot && dotContainerRef.current) {
      dot.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  // Scroll selected driver chip into view
  useEffect(() => {
    if (selectedDriverRef.current) {
      selectedDriverRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDriverId]);

  // Collapse driver strip after selecting
  useEffect(() => {
    if (selectedDriverId) {
      setDriverStripExpanded(false);
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
    <div className="flex flex-col h-full shadow-md rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0">
        <GridToolbar
          onReset={onReset}
          onToggleOfficialResults={onToggleOfficialResults}
          onOpenHistory={onOpenHistory}
          onOpenExport={onOpenExport}
          showOfficialResults={showOfficialResults}
          onToggleConsensus={() => {
            if (hasConsensusAccess) {
              dispatch(toggleConsensus());
            } else {
              onOpenSubscriptionModal();
            }
          }}
          showConsensus={showConsensus}
          hasConsensusAccess={hasConsensusAccess}
        />
      </div>

      {/* Driver strip */}
      <div className="shrink-0 border-b border-gray-200 bg-white">
        {/* Header row with toggle */}
        <button
          onClick={() => setDriverStripExpanded(!driverStripExpanded)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-600 active:bg-gray-50"
        >
          <span className="flex items-center gap-1.5">
            {selectedDriverId ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-700">
                  {getDriverLastName(selectedDriverId)} selected — tap a slot
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(selectDriver(null));
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none"
                >
                  x
                </button>
              </>
            ) : (
              <span>SELECT DRIVER</span>
            )}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${driverStripExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable driver chips */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            driverStripExpanded ? 'max-h-40' : 'max-h-0'
          }`}
        >
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {drivers.map(driver => {
              const team = teamById[driver.team];
              const isSelected = selectedDriverId === driver.id;
              return (
                <button
                  key={driver.id}
                  ref={isSelected ? selectedDriverRef : undefined}
                  onClick={() => handleDriverTap(driver.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-800 shadow-sm'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
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

      {/* Race navigation header */}
      <div className="shrink-0 flex items-center px-2 py-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 disabled:text-gray-300 active:bg-gray-200 transition-colors shrink-0"
          aria-label="Previous race"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center min-w-0">
          <div className="flex items-center gap-1.5">
            {race.countryCode && (
              <img
                src={`/flags/${race.countryCode}.webp`}
                alt={race.country}
                className="flag"
              />
            )}
            <span className="font-bold text-sm text-gray-800 truncate">
              {formatName(race.name)}
            </span>
            {race.isSprint && (
              <span className="text-[10px] bg-gray-600 text-white px-1.5 py-0.5 rounded font-medium">
                SPRINT
              </span>
            )}
            {hasScore ? (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                {lockedPrediction.score?.percentage}%
              </span>
            ) : isLocked ? (
              <span className="text-xs" title="Prediction locked">🔒</span>
            ) : race.completed ? (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Done</span>
            ) : null}
          </div>
          <span className="text-[11px] text-gray-500">
            Race {currentIndex + 1} of {races.length}
          </span>
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === races.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 disabled:text-gray-300 active:bg-gray-200 transition-colors shrink-0"
          aria-label="Next race"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div
        ref={dotContainerRef}
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-hide bg-gray-50 border-b border-gray-200"
      >
        {races.map((r, i) => (
          <button
            key={r.id}
            ref={el => { dotRefs.current[i] = el; }}
            onClick={() => setCurrentIndex(i)}
            className={`shrink-0 rounded-full transition-all duration-200 ${
              i === currentIndex
                ? 'w-4 h-2.5 bg-red-500'
                : r.completed
                ? 'w-2 h-2 bg-green-400'
                : 'w-2 h-2 bg-gray-300'
            }`}
            aria-label={`Go to ${formatName(r.name)}`}
          />
        ))}
      </div>

      {/* Swipeable card body */}
      <div
        {...swipeHandlers}
        className="flex-1 min-h-0 overflow-y-auto p-3"
        key={race.id}
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {Array.from({ length: posCount }, (_, i) => i + 1).map(position => (
            <div key={position} className="flex items-center gap-1.5">
              <div
                className={`w-8 shrink-0 text-center text-xs font-bold rounded py-0.5 ${
                  position <= 3
                    ? 'bg-gray-800 text-white'
                    : position <= 10
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
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
