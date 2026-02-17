import React, { useEffect, useState } from 'react';
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
  selectUpcomingUnlockedRaces,
  selectAwaitingResultsRaces,
  selectScoredRaces,
} from '../store/selectors/lockedPredictionsSelectors';
import { selectDriversByIdMap } from '../store/selectors/dataSelectors';
import { useAuth } from '../hooks/useAuth';
import { useCountdown } from '../hooks/useCountdown';
import useRaceResults from '../hooks/useRaceResults';
import { CURRENT_SEASON, getGridPositions } from '../utils/constants';
import { Race } from '../types';
import LazyDndProvider from '../components/common/LazyDndProvider';
import RaceGrid from '../components/grid/RaceGrid';
import DriverSelection from '../components/drivers/DriverSelection';
import LockConfirmationModal from '../components/predictions/LockConfirmationModal';
import ToastContainer from '../components/common/ToastContainer';
import { getLeaderboard, LeaderboardEntry, PendingEntry } from '../api/leaderboard';

const getDriverCode = (driver: { code?: string; familyName: string } | undefined): string => {
  if (!driver) return '---';
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
};

const Countdown: React.FC<{ date: string }> = ({ date }) => {
  const countdown = useCountdown(date);
  if (!countdown || countdown.isPast) return null;
  return <span className="text-gray-500">{countdown.formatted}</span>;
};

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const Compete: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const races = useSelector((state: RootState) => state.seasonData.races);
  const driverById = useSelector(selectDriversByIdMap);
  const overallAccuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const upcomingRaces = useSelector(selectUpcomingUnlockedRaces);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const scoredRaces = useSelector(selectScoredRaces);

  const [raceToLock, setRaceToLock] = useState<Race | null>(null);
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [leaderboardTotalUsers, setLeaderboardTotalUsers] = useState(0);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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
        setPendingEntries(data.pendingEntries);
        setLeaderboardTotalPages(data.totalPages);
        setLeaderboardTotalUsers(data.totalUsers);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLeaderboardLoading(false);
      });
    return () => { cancelled = true; };
  }, [leaderboardPage]);

  const handleLockRace = (raceId: string) => {
    if (!user?.id) {
      dispatch(openAuthModal('signup'));
      return;
    }
    const race = races.find(r => r.id === raceId);
    if (race) setRaceToLock(race);
  };

  const competeGridPositions = useSelector((state: RootState) => state.competeGrid.positions);
  const nextRacePositions = nextRaceToLock
    ? competeGridPositions
        .filter(p => p.raceId === nextRaceToLock.id && p.driverId)
        .sort((a, b) => a.position - b.position)
    : [];
  const filledCount = nextRacePositions.length;

  return (
    <LazyDndProvider>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer />

        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">F1</span>
              <span className="text-xl font-semibold text-gray-900">Points Calculator</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sandbox
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Compete</h1>
            <p className="text-sm text-gray-500 mt-1">
              Lock predictions before races start, get scored on accuracy, climb the leaderboard.
            </p>
          </div>

          {/* Sign-in CTA if unauthenticated */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏆</span>
                <h2 className="text-lg font-bold text-gray-900">Join the Competition</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sign in to lock your predictions before races start and track your accuracy over the season.
              </p>
              <button
                onClick={() => dispatch(openAuthModal('signup'))}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Sign in to get started
              </button>
            </div>
          )}

          {/* Stats bar */}
          {isAuthenticated && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {scoredCount > 0 ? `${overallAccuracy.percentage}%` : '--'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Overall Accuracy</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{lockedCount}</div>
                <div className="text-xs text-gray-500 mt-1">Races Locked</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{scoredCount}</div>
                <div className="text-xs text-gray-500 mt-1">Races Scored</div>
              </div>
            </div>
          )}

          {/* Prediction Grid */}
          {upcomingRaces.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Set Your Predictions</h2>
              <CompeteGridProvider>
                <DriverSelection />
                <RaceGrid
                  onReset={() => {}}
                  onToggleOfficialResults={() => {}}
                  onOpenHistory={() => {}}
                  onOpenExport={() => {}}
                  showOfficialResults={false}
                  hasConsensusAccess={false}
                  onOpenSubscriptionModal={() => {}}
                  toolbar={null}
                  racesOverride={upcomingRaces}
                  gridPositionCount={getGridPositions(CURRENT_SEASON)}
                />

                {/* Lock Button */}
                {nextRaceToLock && isAuthenticated && (
                  <div className="mt-4 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                    <div>
                      <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                      <div className="text-sm text-gray-500">
                        {filledCount > 0 ? (
                          <span className="text-green-600">{filledCount} positions filled</span>
                        ) : (
                          <span>Drag drivers above to set predictions</span>
                        )}
                        {nextRaceToLock.date && (
                          <span className="ml-2">
                            · Locks in <Countdown date={nextRaceToLock.date} />
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLockRace(nextRaceToLock.id)}
                      disabled={filledCount === 0}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                    >
                      🔒 Lock Prediction
                    </button>
                  </div>
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
            </div>
          )}

          {/* Awaiting Results */}
          {awaitingResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Awaiting Results</h2>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {awaitingResults.map(({ race, lockedPrediction }) => (
                  <div key={race.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{formatName(race.name)}</span>
                      {race.date && <Countdown date={race.date} />}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...lockedPrediction.positions]
                        .sort((a, b) => a.position - b.position)
                        .map((pos) => {
                          const driver = driverById[pos.driverId];
                          return (
                            <span key={pos.position} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              P{pos.position} {getDriverCode(driver)}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scored Races */}
          {scoredRaces.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Scored Races</h2>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {scoredRaces.map(({ race, lockedPrediction }) => {
                  const isExpanded = expandedRaceId === race.id;
                  const score = lockedPrediction.score;
                  return (
                    <div key={race.id}>
                      <button
                        onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{formatName(race.name)}</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${
                            (score?.percentage ?? 0) >= 40 ? 'bg-green-100 text-green-700' :
                            (score?.percentage ?? 0) >= 25 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {score?.percentage}%
                          </span>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && lockedPrediction.breakdown && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-x-3 gap-y-1 text-sm">
                            {lockedPrediction.breakdown.map((item) => {
                              const driver = driverById[item.predictedDriverId];
                              return (
                                <div key={item.position} className="flex items-center gap-1">
                                  <span className={item.isExact ? 'text-green-600' : 'text-gray-300'}>
                                    {item.isExact ? '●' : '○'}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {getDriverCode(driver)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Leaderboard
              {leaderboardTotalUsers > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {leaderboardTotalUsers} predictor{leaderboardTotalUsers !== 1 ? 's' : ''}
                </span>
              )}
            </h2>

            {leaderboardLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-500 mt-3 text-sm">Loading leaderboard...</p>
              </div>
            ) : leaderboardEntries.length === 0 && pendingEntries.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No predictions yet. Be the first!</p>
              </div>
            ) : (
              <>
                {leaderboardEntries.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-16">Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Predictor</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-20">Races</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Accuracy</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-28">Exact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leaderboardEntries.map(entry => (
                          <tr key={entry.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-lg">{getRankBadge(entry.rank || 0)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {entry.image ? (
                                  <img src={entry.image} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                                    {getInitials(entry.name)}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">{entry.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{entry.racesScored}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${
                                entry.accuracy >= 40 ? 'bg-green-100 text-green-700' :
                                entry.accuracy >= 25 ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {entry.accuracy}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{entry.exactMatches}/{entry.totalPositions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {leaderboardTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 p-4 border-t border-gray-200">
                        <button
                          onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                          disabled={leaderboardPage <= 1}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600">
                          Page {leaderboardPage} of {leaderboardTotalPages}
                        </span>
                        <button
                          onClick={() => setLeaderboardPage(p => Math.min(leaderboardTotalPages, p + 1))}
                          disabled={leaderboardPage >= leaderboardTotalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending predictions */}
                {pendingEntries.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-bold text-gray-900 mb-3">Upcoming Predictions</h3>
                    <div className="space-y-3">
                      {pendingEntries.map(entry => (
                        <div key={entry.userId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                            {entry.image ? (
                              <img src={entry.image} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                {getInitials(entry.name)}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{entry.name}</span>
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            {entry.predictions.map((pred, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 w-32 flex-shrink-0">{formatName(pred.raceName)}</span>
                                <div className="flex gap-1 flex-wrap">
                                  {pred.drivers.map((driver, j) => (
                                    <span
                                      key={j}
                                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                        j === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        j === 1 ? 'bg-gray-200 text-gray-700' :
                                        j === 2 ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      <span className="font-medium">{j + 1}.</span>
                                      <span>{driver}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">Think you can do better?</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Make Your Predictions
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <Link to="/" className="text-red-600 hover:underline">F1 Points Calculator</Link>
          <span className="mx-2">&mdash;</span>
          Predict F1 race results and track your accuracy
        </footer>
      </div>
    </LazyDndProvider>
  );
};

export default Compete;
