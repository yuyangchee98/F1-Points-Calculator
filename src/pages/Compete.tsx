import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, useAppDispatch } from '../store';
import { CompeteGridProvider } from '../contexts/GridContext';
import { openAuthModal } from '../store/slices/authSlice';
import { fetchLockedPredictions } from '../store/slices/lockedPredictionsSlice';
import {
  selectOverallAccuracy,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectNextRaceToLock,
  selectAwaitingResultsRaces,
  selectScoredRaces,
  selectLockedPredictions,
} from '../store/selectors/lockedPredictionsSelectors';
import { selectDriversByIdMap } from '../store/selectors/dataSelectors';
import { useAuth } from '../hooks/useAuth';
import { useCountdown } from '../hooks/useCountdown';
import useRaceResults from '../hooks/useRaceResults';
import { CURRENT_SEASON, getGridPositions } from '../utils/constants';
import { Race } from '../types';
import LazyDndProvider from '../components/common/LazyDndProvider';
import DriverCard from '../components/drivers/DriverCard';
import SingleRaceGrid from '../components/compete/SingleRaceGrid';
import LockConfirmationModal from '../components/predictions/LockConfirmationModal';
import ToastContainer from '../components/common/ToastContainer';
import { getLeaderboard, LeaderboardEntry } from '../api/leaderboard';
import AuthModal from '../components/auth/AuthModal';
import { selectDriver } from '../store/slices/uiSlice';
import { selectTeamsByIdMap, getDriverLastName } from '../store/selectors/dataSelectors';
import useWindowSize from '../hooks/useWindowSize';

// ─── Helpers ──────────────────────────────────────────

type Tab = 'predict' | 'results' | 'leaderboard';

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const getDriverCode = (driver: { code?: string; familyName: string } | undefined): string => {
  if (!driver) return '---';
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
};

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const Countdown: React.FC<{ date: string; prefix?: string }> = ({ date, prefix }) => {
  const countdown = useCountdown(date);
  if (!countdown || countdown.isPast) return null;
  return <span>{prefix && `${prefix} `}{countdown.formatted}</span>;
};

// ─── Component ────────────────────────────────────────

const Compete: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const allDrivers = useSelector((state: RootState) => state.seasonData.drivers);
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const lockedPredictions = useSelector(selectLockedPredictions);
  const { isMobile } = useWindowSize();
  const overallAccuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const scoredRaces = useSelector(selectScoredRaces);

  const [raceToLock, setRaceToLock] = useState<Race | null>(null);
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [leaderboardTotalUsers, setLeaderboardTotalUsers] = useState(0);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Smart default tab
  const getDefaultTab = (): Tab => {
    const hash = window.location.hash.replace('#', '') as Tab;
    if (['predict', 'results', 'leaderboard'].includes(hash)) return hash;
    if (nextRaceToLock) return 'predict';
    if (scoredRaces.length > 0) return 'results';
    return 'leaderboard';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getDefaultTab);

  // Sync hash
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Tab;
      if (['predict', 'results', 'leaderboard'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useRaceResults(CURRENT_SEASON);

  // Fetch locked predictions
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLockedPredictions({ identifier: { userId: user.id }, season: CURRENT_SEASON }));
    }
  }, [user, dispatch]);

  // Fetch leaderboard
  useEffect(() => {
    let cancelled = false;
    setLeaderboardLoading(true);
    getLeaderboard(leaderboardPage, CURRENT_SEASON)
      .then(data => {
        if (cancelled) return;
        setLeaderboardEntries(data.entries);
        setLeaderboardTotalPages(data.totalPages);
        setLeaderboardTotalUsers(data.totalUsers);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });
    return () => { cancelled = true; };
  }, [leaderboardPage]);

  const handleDriverClick = (driverId: string) => {
    dispatch(selectDriver(selectedDriverId === driverId ? null : driverId));
  };

  const handleLockRace = () => {
    if (!user?.id) {
      dispatch(openAuthModal('signup'));
      return;
    }
    if (nextRaceToLock) setRaceToLock(nextRaceToLock);
  };

  // Count filled positions for the next race in the compete grid
  const competeGridPositions = useSelector((state: RootState) => state.competeGrid.positions);
  const filledCount = nextRaceToLock
    ? competeGridPositions.filter(p => p.raceId === nextRaceToLock.id && p.driverId).length
    : 0;
  const gridPositionCount = getGridPositions(CURRENT_SEASON);

  // Hero card status
  const nextRace = nextRaceToLock || awaitingResults[0]?.race;
  const isNextRaceLocked = nextRace ? !!lockedPredictions[nextRace.id] : false;

  // User's leaderboard rank
  const userRank = useMemo(() => {
    if (!user?.id) return null;
    return leaderboardEntries.find(e => e.userId === user.id) || null;
  }, [leaderboardEntries, user]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'predict',
      label: 'Predict',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'results',
      label: 'Results',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <LazyDndProvider>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer />

        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">F1</span>
              <span className="text-lg font-semibold text-gray-900">Compete</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Sandbox
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* How it works */}
          <div className="max-w-3xl mx-auto mb-6 bg-white rounded-lg border border-gray-200 p-4 flex gap-5 items-center">
            {/* Explanation */}
            <div className="text-sm text-gray-600 min-w-0">
              <div className="font-semibold text-gray-900 mb-1">Predict. Lock. Score.</div>
              <p>
                Drag drivers into your predicted finishing order and lock your prediction before the race starts. After the race, you score a point for every position you got exactly right. Lock every race to climb the season leaderboard.
              </p>
            </div>

            {/* Mini prediction vs actual visual */}
            <div className="flex-shrink-0 hidden sm:block">
              <div className="flex gap-2 text-[10px] text-gray-400 font-medium mb-1.5 pl-7">
                <span className="w-16 text-center">Your pick</span>
                <span className="w-16 text-center">Actual</span>
              </div>
              {[
                { pos: 1, pick: 'VER', actual: 'VER', color: '#3671C6', exact: true },
                { pos: 2, pick: 'NOR', actual: 'LEC', color: '#FF8000', actualColor: '#E80020', exact: false },
                { pos: 3, pick: 'PIA', actual: 'PIA', color: '#FF8000', exact: true },
                { pos: 4, pick: 'SAI', actual: 'HAM', color: '#E80020', actualColor: '#27F4D2', exact: false },
              ].map(row => (
                <div key={row.pos} className={`flex items-center gap-2 mb-1 rounded px-1 py-0.5 ${row.exact ? 'bg-green-50' : ''}`}>
                  <span className={`w-5 text-[10px] font-bold text-center rounded py-px ${row.pos <= 3 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {row.pos}
                  </span>
                  <div className="w-16 flex items-center gap-1 bg-white rounded border border-gray-200 px-1.5 py-1 shadow-sm">
                    <div className="w-1 h-3 rounded-sm" style={{ backgroundColor: row.color }} />
                    <span className="text-[10px] font-bold text-gray-700">{row.pick}</span>
                  </div>
                  <div className="w-16 flex items-center gap-1 bg-white rounded border border-gray-200 px-1.5 py-1 shadow-sm">
                    <div className="w-1 h-3 rounded-sm" style={{ backgroundColor: row.exact ? row.color : row.actualColor }} />
                    <span className="text-[10px] font-bold text-gray-700">{row.actual}</span>
                  </div>
                  {row.exact ? (
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sign-in banner */}
          {!isAuthenticated && (
            <div className="max-w-3xl mx-auto bg-red-600 rounded-lg p-5 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Join the Competition</h2>
                  <p className="text-red-100 text-sm mt-1">
                    Lock predictions before races, get scored on accuracy, climb the leaderboard.
                  </p>
                </div>
                <button
                  onClick={() => dispatch(openAuthModal('signup'))}
                  className="flex-shrink-0 bg-white text-red-600 font-semibold py-2 px-5 rounded-md hover:bg-red-50 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Hero Card */}
          {nextRace && (
            <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {nextRace.countryCode && (
                    <img
                      src={`/flags/${nextRace.countryCode}.webp`}
                      alt={nextRace.country}
                      className="w-8 h-6 object-cover rounded shadow-sm"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{formatName(nextRace.name)}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                      {nextRace.date && <Countdown date={nextRace.date} prefix="Locks in" />}
                      {isNextRaceLocked ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Locked
                        </span>
                      ) : filledCount > 0 ? (
                        <span className="text-amber-600 font-medium">
                          {filledCount}/{gridPositionCount} filled
                        </span>
                      ) : (
                        <span className="text-gray-400">No predictions yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {!isNextRaceLocked && nextRaceToLock && isAuthenticated && (
                  <button
                    onClick={handleLockRace}
                    disabled={filledCount === 0}
                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-md transition-colors flex items-center gap-2"
                  >
                    Lock Prediction
                  </button>
                )}
              </div>
            </div>
          )}

          {!nextRace && (
            <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 p-5 mb-6 text-center">
              <p className="text-gray-500">No upcoming races. Season complete!</p>
            </div>
          )}

          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 mb-6 max-w-3xl mx-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Predict Tab ─── */}
          {activeTab === 'predict' && (
            <>
              {!isAuthenticated ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Sign in to set your predictions.</p>
                  <button
                    onClick={() => dispatch(openAuthModal('signup'))}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              ) : !nextRaceToLock ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No upcoming races to predict.</p>
                </div>
              ) : (
                <CompeteGridProvider>
                  {/* Mobile: horizontal driver chip strip */}
                  {isMobile && (
                    <div className="mb-4 -mx-4 px-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {allDrivers.map(driver => {
                          const team = teamById[driver.team];
                          const isSelected = selectedDriverId === driver.id;
                          return (
                            <button
                              key={driver.id}
                              onClick={() => handleDriverClick(driver.id)}
                              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 shadow-md scale-105'
                                  : 'hover:scale-105'
                              }`}
                              style={{
                                borderLeft: `3px solid ${team?.color || '#ccc'}`,
                                backgroundColor: isSelected ? `${team?.color}15` : 'white',
                              }}
                            >
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
                  )}

                  {/* Desktop: side-by-side layout */}
                  {!isMobile ? (
                    <div className="flex gap-4">
                      {/* Drivers — responsive columns */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Drivers</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1 pb-2">
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

                      {/* Grid — triple-column positions */}
                      <div className="w-[500px] flex-shrink-0">
                        <SingleRaceGrid race={nextRaceToLock} />
                      </div>
                    </div>
                  ) : (
                    <SingleRaceGrid race={nextRaceToLock} columns={2} />
                  )}

                  {/* Lock confirmation modal */}
                  {raceToLock && (
                    <LockConfirmationModal
                      race={raceToLock}
                      onClose={() => setRaceToLock(null)}
                      onSuccess={() => {
                        setRaceToLock(null);
                        if (user?.id) {
                          dispatch(fetchLockedPredictions({ identifier: { userId: user.id }, season: CURRENT_SEASON }));
                        }
                      }}
                    />
                  )}
                </CompeteGridProvider>
              )}
            </>
          )}

          {/* ─── Results Tab ─── */}
          {activeTab === 'results' && (
            <div className="max-w-3xl mx-auto">
              {!isAuthenticated ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Sign in to see your results.</p>
                  <button
                    onClick={() => dispatch(openAuthModal('signup'))}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {scoredCount > 0 ? `${overallAccuracy.percentage}%` : '--'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Accuracy</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{lockedCount}</div>
                      <div className="text-xs text-gray-500 mt-1">Locked</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{scoredCount}</div>
                      <div className="text-xs text-gray-500 mt-1">Scored</div>
                    </div>
                  </div>

                  {/* Scored Races */}
                  {scoredRaces.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Scored Races</h3>
                      <div className="space-y-3">
                        {scoredRaces.map(({ race, lockedPrediction }) => {
                          const isExpanded = expandedRaceId === race.id;
                          const score = lockedPrediction.score;
                          return (
                            <div key={race.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {race.countryCode && (
                                    <img
                                      src={`/flags/${race.countryCode}.webp`}
                                      alt={race.country}
                                      className="w-6 h-4 object-cover rounded shadow-sm"
                                    />
                                  )}
                                  <span className="font-medium text-gray-900">{formatName(race.name)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    (score?.percentage ?? 0) >= 40 ? 'bg-green-100 text-green-700' :
                                    (score?.percentage ?? 0) >= 25 ? 'bg-amber-100 text-amber-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {score?.exact}/{score?.total} exact ({score?.percentage}%)
                                  </span>
                                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              {isExpanded && lockedPrediction.breakdown && (
                                <div className="border-t border-gray-100">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <th className="px-4 py-2 text-left w-14">Pos</th>
                                        <th className="px-4 py-2 text-left">Your Pick</th>
                                        <th className="px-4 py-2 text-left">Actual</th>
                                        <th className="px-4 py-2 text-center w-12"></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {lockedPrediction.breakdown.map(item => {
                                        const predicted = driverById[item.predictedDriverId];
                                        const actual = item.actualDriverId ? driverById[item.actualDriverId] : null;
                                        return (
                                          <tr
                                            key={item.position}
                                            className={item.isExact ? 'bg-green-50' : ''}
                                          >
                                            <td className="px-4 py-2 font-medium text-gray-500">P{item.position}</td>
                                            <td className="px-4 py-2 font-medium text-gray-900">
                                              {getDriverCode(predicted)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                              {actual ? getDriverCode(actual) : '--'}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              {item.isExact ? (
                                                <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : (
                                                <svg className="w-4 h-4 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Awaiting Results */}
                  {awaitingResults.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Awaiting Results</h3>
                      <div className="space-y-3">
                        {awaitingResults.map(({ race, lockedPrediction }) => (
                          <div key={race.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {race.countryCode && (
                                  <img
                                    src={`/flags/${race.countryCode}.webp`}
                                    alt={race.country}
                                    className="w-6 h-4 object-cover rounded shadow-sm"
                                  />
                                )}
                                <span className="font-medium text-gray-900">{formatName(race.name)}</span>
                              </div>
                              {race.date && (
                                <span className="text-sm text-gray-500"><Countdown date={race.date} /></span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {[...lockedPrediction.positions]
                                .sort((a, b) => a.position - b.position)
                                .slice(0, 10)
                                .map(pos => {
                                  const driver = driverById[pos.driverId];
                                  return (
                                    <span key={pos.position} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                                      P{pos.position} {getDriverCode(driver)}
                                    </span>
                                  );
                                })}
                              {lockedPrediction.positions.length > 10 && (
                                <span className="text-xs text-gray-400 px-2 py-0.5">
                                  +{lockedPrediction.positions.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scoredRaces.length === 0 && awaitingResults.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-2">No results yet.</p>
                      <p className="text-sm text-gray-400">Lock a prediction and wait for the race to finish.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Leaderboard Tab ─── */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-3xl mx-auto">
              {/* User rank summary */}
              {userRank && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRankBadge(userRank.rank || 0)}</span>
                    <div>
                      <div className="font-bold text-gray-900">Your Rank</div>
                      <div className="text-sm text-gray-600">
                        {userRank.accuracy}% accuracy · {userRank.exactMatches}/{userRank.totalPositions} exact
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mb-3">
                {leaderboardTotalUsers} predictor{leaderboardTotalUsers !== 1 ? 's' : ''} this season
              </div>

              {leaderboardLoading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-500 mt-3 text-sm">Loading leaderboard...</p>
                </div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No predictions scored yet. Be the first!</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-14">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Predictor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-16">Races</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Accuracy</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-20">Exact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboardEntries.map(entry => {
                        const isCurrentUser = user?.id === entry.userId;
                        return (
                          <tr
                            key={entry.userId}
                            className={`transition-colors ${isCurrentUser ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">
                              <span className="text-lg">{getRankBadge(entry.rank || 0)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {entry.image ? (
                                  <img src={entry.image} alt={entry.name} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                                    {getInitials(entry.name)}
                                  </div>
                                )}
                                <span className={`font-medium ${isCurrentUser ? 'text-amber-700' : 'text-gray-900'}`}>
                                  {entry.name} {isCurrentUser && <span className="text-xs text-amber-500">(you)</span>}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{entry.racesScored}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                entry.accuracy >= 40 ? 'bg-green-100 text-green-700' :
                                entry.accuracy >= 25 ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {entry.accuracy}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">
                              {entry.exactMatches}/{entry.totalPositions}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {leaderboardTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                      <button
                        onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                        disabled={leaderboardPage <= 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1.5 text-sm text-gray-500">
                        {leaderboardPage} / {leaderboardTotalPages}
                      </span>
                      <button
                        onClick={() => setLeaderboardPage(p => Math.min(leaderboardTotalPages, p + 1))}
                        disabled={leaderboardPage >= leaderboardTotalPages}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        <AuthModal />
      </div>
    </LazyDndProvider>
  );
};

export default Compete;
