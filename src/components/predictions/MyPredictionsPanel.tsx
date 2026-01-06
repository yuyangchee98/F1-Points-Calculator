import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import {
  selectTotalLockedScore,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectNextRaceToLock,
  selectAwaitingResultsRaces,
  selectScoredRaces,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useCountdown } from '../../hooks/useCountdown';

interface MyPredictionsPanelProps {
  onClose: () => void;
  onLockRace: (raceId: string) => void;
  onUnlockRace: (raceId: string) => void;
}

const RaceCountdownBadge: React.FC<{ date: string }> = ({ date }) => {
  const countdown = useCountdown(date);

  if (!countdown || countdown.isPast) {
    return <span className="text-gray-400 text-sm">Started</span>;
  }

  return (
    <span className="text-gray-500 text-sm">
      Locks in {countdown.formatted}
    </span>
  );
};

const MyPredictionsPanel: React.FC<MyPredictionsPanelProps> = ({
  onClose,
  onLockRace,
  onUnlockRace,
}) => {
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  const totalScore = useSelector(selectTotalLockedScore);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const scoredRaces = useSelector(selectScoredRaces);
  const driverById = useSelector(selectDriversByIdMap);
  const races = useSelector((state: RootState) => state.seasonData.races);

  const formatRaceName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getScoreColor = (points: number) => {
    if (points === 3) return 'text-green-600 bg-green-100';
    if (points === 1) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (points: number) => {
    if (points === 3) return '✓';
    if (points === 1) return '↕';
    return '✗';
  };

  const maxPossibleScore = scoredCount * 30;
  const accuracy = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  const toggleExpanded = (raceId: string) => {
    setExpandedRaceId(expandedRaceId === raceId ? null : raceId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>🎯</span> My Predictions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Summary stats */}
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{totalScore} pts</span>
            {scoredCount > 0 && (
              <>
                <span className="mx-2">·</span>
                <span>{accuracy}% accuracy</span>
              </>
            )}
            <span className="mx-2">·</span>
            <span>{lockedCount}/{races.length} races</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section: Lock Your Prediction */}
          {nextRaceToLock && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>⚡</span> Lock Your Prediction
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">
                      {formatRaceName(nextRaceToLock.name)}
                    </div>
                    {nextRaceToLock.date && <RaceCountdownBadge date={nextRaceToLock.date} />}
                  </div>
                  <button
                    onClick={() => onLockRace(nextRaceToLock.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Lock Prediction
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Awaiting Results */}
          {awaitingResults.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>⏳</span> Awaiting Results ({awaitingResults.length})
              </h3>
              <div className="space-y-2">
                {awaitingResults.map(({ race }) => (
                  <div
                    key={race.id}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🔒</span>
                      <span className="font-medium text-gray-800">{formatRaceName(race.name)}</span>
                      {race.date && (
                        <span className="text-gray-500 text-sm">
                          · Race {new Date(race.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onUnlockRace(race.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Unlock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Scored Results */}
          {scoredRaces.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>📊</span> Scored Results ({scoredRaces.length})
              </h3>
              <div className="space-y-2">
                {scoredRaces.map(({ race, lockedPrediction }) => {
                  const isExpanded = expandedRaceId === race.id;

                  return (
                    <div
                      key={race.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Collapsed row */}
                      <button
                        onClick={() => toggleExpanded(race.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                          <span className="font-medium text-gray-800">
                            {formatRaceName(race.name)}
                          </span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {lockedPrediction.score}/30 pts
                        </span>
                      </button>

                      {/* Expanded breakdown */}
                      {isExpanded && lockedPrediction.breakdown && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-2">
                            {lockedPrediction.breakdown.map((score) => {
                              const predictedDriver = driverById[score.predictedDriverId];

                              return (
                                <div
                                  key={score.position}
                                  className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 w-6">
                                      P{score.position}
                                    </span>
                                    <span className="text-sm">
                                      {predictedDriver?.familyName || '-'}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getScoreColor(
                                      score.points
                                    )}`}
                                  >
                                    {getScoreIcon(score.points)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Legend */}
                          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="inline-block w-4 h-4 rounded bg-green-100 text-green-600 text-center text-xs leading-4">✓</span>
                              Exact
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="inline-block w-4 h-4 rounded bg-yellow-100 text-yellow-600 text-center text-xs leading-4">↕</span>
                              Off by 1
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="inline-block w-4 h-4 rounded bg-red-100 text-red-600 text-center text-xs leading-4">✗</span>
                              Wrong
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!nextRaceToLock && awaitingResults.length === 0 && scoredRaces.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg mb-2">No predictions yet</p>
              <p className="text-sm">Make your predictions on the grid and lock them before races start!</p>
            </div>
          )}

          {/* Season complete state */}
          {!nextRaceToLock && awaitingResults.length === 0 && scoredRaces.length === races.length && races.length > 0 && (
            <div className="text-center py-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
              <span className="text-4xl">🏆</span>
              <p className="text-lg font-semibold text-gray-800 mt-2">Season Complete!</p>
              <p className="text-gray-600">
                Final Score: {totalScore}/{races.length * 30} pts ({accuracy}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPredictionsPanel;
