import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from '../../store';
import { openAuthModal } from '../../store/slices/authSlice';
import { fetchLockedPredictions } from '../../store/slices/lockedPredictionsSlice';
import { selectDriver } from '../../store/slices/uiSlice';
import {
  selectNextWeekendRacesToLock,
  selectAwaitingResultsRaces,
  selectLockedPredictions,
} from '../../store/selectors/lockedPredictionsSelectors';
import { selectTeamsByIdMap, getDriverLastName } from '../../store/selectors/dataSelectors';
import { useAuth } from '../../hooks/useAuth';
import useWindowSize from '../../hooks/useWindowSize';
import { CURRENT_SEASON, getGridPositions } from '../../utils/constants';
import type { Race } from '../../types';
import { CompeteGridProvider } from '../../contexts/GridContext';
import TeamColorStripe from '../../components/common/TeamColorStripe';
import DriverCard from '../../components/drivers/DriverCard';
import SingleRaceGrid from '../../components/compete/SingleRaceGrid';
import LockConfirmationModal from '../../components/predictions/LockConfirmationModal';
import LockedSummary from '../../components/compete/LockedSummary';
import RaceFlag from '../../components/compete/RaceFlag';
import { PanelLoading } from '../../components/compete/PanelLoading';
import PageHead from '../../components/layout/PageHead';
import SectionLabel from '../../components/layout/SectionLabel';
import ProgressBar from '../../components/ui/ProgressBar';
import { buttonClasses } from '../../components/ui/Button';
import { formatRaceName, raceTitle } from './format';

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth={2} />
    <path strokeLinecap="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

/** Sprint/Race switch for the page head. Locked sessions carry a tick. */
const SessionSwitch: React.FC<{
  races: Race[];
  activeIndex: number;
  locked: (race: Race) => boolean;
  onChange: (index: number) => void;
}> = ({ races, activeIndex, locked, onChange }) => (
  <div role="tablist" aria-label="Weekend session" className="flex bg-carbon-100 rounded-lg p-1">
    {races.map((r, i) => {
      const selected = i === activeIndex;
      return (
        <button
          key={r.id}
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(i)}
          className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
            selected ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'
          }`}
        >
          {r.isSprint ? 'Sprint' : 'Race'}
          {locked(r) && <span className="ml-1 text-success" aria-label="locked">✓</span>}
        </button>
      );
    })}
  </div>
);

const PredictPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isMobile } = useWindowSize();
  const allDrivers = useSelector((state: RootState) => state.seasonData.drivers);
  const teamById = useSelector(selectTeamsByIdMap);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const lockedPredictions = useSelector(selectLockedPredictions);
  const nextWeekendRaces = useSelector(selectNextWeekendRacesToLock);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const competeGridPositions = useSelector((state: RootState) => state.competeGrid.positions);
  const racesLoaded = useSelector((state: RootState) => state.seasonData.isLoaded);
  const locksFetched = useSelector((state: RootState) => state.lockedPredictions.hasFetched);

  const [raceToLock, setRaceToLock] = useState<Race | null>(null);
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);

  const isSprintWeekend = nextWeekendRaces.length > 1;
  const activeRace = nextWeekendRaces[activeRaceIndex] || null;
  const isLocked = (race: Race) => !!lockedPredictions[race.id];
  const isActiveRaceLocked = activeRace ? isLocked(activeRace) : false;
  const allWeekendLocked = nextWeekendRaces.length > 0 && nextWeekendRaces.every(isLocked);

  // Default to the first unlocked session of the weekend (e.g. skip a locked sprint).
  useEffect(() => {
    if (nextWeekendRaces.length === 0) return;
    if (activeRaceIndex >= nextWeekendRaces.length) {
      setActiveRaceIndex(0);
      return;
    }
    const firstUnlockedIdx = nextWeekendRaces.findIndex(r => !lockedPredictions[r.id]);
    if (firstUnlockedIdx >= 0 && lockedPredictions[nextWeekendRaces[activeRaceIndex]?.id]) {
      setActiveRaceIndex(firstUnlockedIdx);
    }
  }, [nextWeekendRaces, lockedPredictions]);

  const filledCount = activeRace
    ? competeGridPositions.filter(p => p.raceId === activeRace.id && p.driverId).length
    : 0;
  const gridPositionCount = getGridPositions(CURRENT_SEASON);

  const handleDriverClick = (driverId: string) => {
    dispatch(selectDriver(selectedDriverId === driverId ? null : driverId));
  };

  const handleLock = () => {
    if (!user?.id) {
      dispatch(openAuthModal('signup'));
      return;
    }
    if (activeRace && !isActiveRaceLocked) setRaceToLock(activeRace);
  };

  // Until the session, the schedule and (for a signed-in user) their locks are
  // known, every branch below would be a guess: an empty schedule reads as "the
  // season is complete", and an unloaded lock map shows a grid for a race the
  // user has already locked.
  if (authLoading || !racesLoaded || (isAuthenticated && !locksFetched)) {
    return <PanelLoading />;
  }

  // ── Nothing open to predict ──
  if (nextWeekendRaces.length === 0) {
    return (
      <>
        <PageHead eyebrow={`${CURRENT_SEASON} season`} title="Predict" />
        {isAuthenticated && awaitingResults.length > 0 ? (
          <div className="space-y-3">
            {awaitingResults.map(({ race, lockedPrediction }) => (
              <LockedSummary
                key={race.id}
                race={race}
                prediction={lockedPrediction}
                note="Your prediction is locked. The next race opens for predictions once these results are in."
              />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted py-8">No upcoming races to predict. The season is complete.</p>
        )}
      </>
    );
  }

  const headRace = activeRace ?? nextWeekendRaces[0];

  const actions = (
    <>
      {isSprintWeekend && (
        <SessionSwitch
          races={nextWeekendRaces}
          activeIndex={activeRaceIndex}
          locked={isLocked}
          onChange={setActiveRaceIndex}
        />
      )}
      {!isActiveRaceLocked && (
        <div className="flex items-center gap-2 text-xs text-ink-secondary tnum">
          <ProgressBar value={filledCount} max={gridPositionCount} aria-label="Positions filled" />
          {filledCount} / {gridPositionCount}
        </div>
      )}
      {!isActiveRaceLocked && (
        isAuthenticated ? (
          <button
            type="button"
            onClick={handleLock}
            disabled={filledCount === 0}
            className={buttonClasses({ variant: 'primary', className: 'font-semibold' })}
          >
            <LockIcon />
            Lock prediction
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLock}
            className={buttonClasses({ variant: 'primary', className: 'font-semibold' })}
          >
            <LockIcon />
            Sign in to lock
          </button>
        )
      )}
    </>
  );

  return (
    <>
      <PageHead
        leading={<RaceFlag race={headRace} size="md" />}
        eyebrow={[headRace.round && `Round ${headRace.round}`, isSprintWeekend && 'Sprint weekend'].filter(Boolean).join(' · ') || undefined}
        title={raceTitle(headRace)}
        actions={actions}
      />

      {allWeekendLocked ? (
        <div className="space-y-3">
          {nextWeekendRaces.map(race => (
            <LockedSummary key={race.id} race={race} prediction={lockedPredictions[race.id]} />
          ))}
        </div>
      ) : (
        <CompeteGridProvider>
          {isActiveRaceLocked && activeRace && (
            <LockedSummary race={activeRace} prediction={lockedPredictions[activeRace.id]} />
          )}

          {!isActiveRaceLocked && activeRace && (
            isMobile ? (
              <>
                {/* Mobile: horizontal driver chip strip, tap a chip then a slot */}
                <div className="mb-4 -mx-4 px-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allDrivers.map(driver => {
                      const team = teamById[driver.team];
                      const isSelected = selectedDriverId === driver.id;
                      return (
                        <button
                          key={driver.id}
                          onClick={() => handleDriverClick(driver.id)}
                          className={`relative overflow-hidden flex-shrink-0 flex items-center gap-1.5 py-1.5 pr-2.5 rounded-md text-xs font-bold transition-all ${
                            isSelected ? 'ring-2 ring-interactive shadow-md scale-105' : 'hover:scale-105'
                          }`}
                          style={{ paddingLeft: '13px', backgroundColor: isSelected ? `${team?.color}15` : 'white' }}
                        >
                          <TeamColorStripe team={team} widthPx={3} />
                          <span style={{ color: team?.color || '#555' }}>
                            {getDriverLastName(driver.id).slice(0, 3).toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDriverId && (
                    <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-blue-50 rounded-md text-sm">
                      <span className="text-blue-700 font-medium">
                        {getDriverLastName(selectedDriverId)} selected — tap a position to place
                      </span>
                      <button
                        onClick={() => dispatch(selectDriver(null))}
                        className="text-blue-500 hover:text-blue-700 font-bold ml-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {/* The page head already names the race and holds the
                    sprint/race switch, so the grid's own header is dropped. */}
                <SingleRaceGrid race={activeRace} columns={2} hideHeader />
              </>
            ) : (
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_28rem]">
                <div className="min-w-0">
                  <SectionLabel hint="Click a driver, then a slot · or drag">Drivers</SectionLabel>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 pb-2">
                    {allDrivers.map(driver => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        isSelected={selectedDriverId === driver.id}
                        onClick={() => handleDriverClick(driver.id)}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0">
                  <SectionLabel hint={`P1–P${gridPositionCount}`}>
                    Your {formatRaceName(activeRace.name)} order
                  </SectionLabel>
                  <SingleRaceGrid race={activeRace} columns={2} hideHeader />
                </div>
              </div>
            )
          )}

          {raceToLock && (
            <LockConfirmationModal
              race={raceToLock}
              onClose={() => setRaceToLock(null)}
              onSuccess={() => {
                setRaceToLock(null);
                if (user?.id) {
                  dispatch(fetchLockedPredictions({ identifier: { userId: user.id }, season: CURRENT_SEASON }));
                }
                // Move on to the other session on sprint weekends.
                if (isSprintWeekend && nextWeekendRaces.length === 2) {
                  setActiveRaceIndex(activeRaceIndex === 0 ? 1 : 0);
                }
              }}
            />
          )}
        </CompeteGridProvider>
      )}
    </>
  );
};

export default PredictPanel;
