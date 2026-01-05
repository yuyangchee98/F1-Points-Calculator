import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import {
  selectTotalLockedScore,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectUpcomingUnlockedRaces,
  selectLockedRacesWithScores,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useCountdown } from '../../hooks/useCountdown';

interface MyPredictionsPanelProps {
  onClose: () => void;
  onLockRace: (raceId: string) => void;
}

type TabType = 'upcoming' | 'results';

const RaceCountdownBadge: React.FC<{ date: string }> = ({ date }) => {
  const countdown = useCountdown(date);

  if (!countdown || countdown.isPast) {
    return <span className="text-gray-400 text-sm">Started</span>;
  }

  return (
    <span className="text-gray-500 text-sm">
      Starts in {countdown.formatted}
    </span>
  );
};

const MyPredictionsPanel: React.FC<MyPredictionsPanelProps> = ({
  onClose,
  onLockRace,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const totalScore = useSelector(selectTotalLockedScore);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const upcomingRaces = useSelector(selectUpcomingUnlockedRaces);
  const lockedRacesWithScores = useSelector(selectLockedRacesWithScores);
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
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-800">{totalScore} pts</div>
              <div className="text-sm text-gray-600">
                Locked: {lockedCount}/{races.length} races
                {scoredCount > 0 && ` • Scored: ${scoredCount}`}
              </div>
            </div>
            {scoredCount > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Best possible</div>
                <div className="text-lg font-semibold text-gray-700">
                  {scoredCount * 30} pts
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Upcoming ({upcomingRaces.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Results ({lockedRacesWithScores.filter(r => r.lockedPrediction.score !== undefined).length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {upcomingRaces.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No upcoming races to lock.</p>
                  <p className="text-sm mt-2">All available races have been locked!</p>
                </div>
              ) : (
                upcomingRaces.map(race => (
                  <div
                    key={race.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {formatRaceName(race.name)}
                      </div>
                      {race.date && <RaceCountdownBadge date={race.date} />}
                    </div>
                    <button
                      onClick={() => onLockRace(race.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Lock Now
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              {lockedRacesWithScores.filter(r => r.lockedPrediction.score !== undefined).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No scored races yet.</p>
                  <p className="text-sm mt-2">Lock predictions and wait for races to complete!</p>
                </div>
              ) : (
                lockedRacesWithScores
                  .filter(r => r.lockedPrediction.score !== undefined)
                  .map(({ race, lockedPrediction }) => (
                    <div
                      key={race.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                        <div className="font-semibold text-gray-800">
                          {formatRaceName(race.name)}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {lockedPrediction.score}/30 pts
                        </div>
                      </div>

                      {lockedPrediction.breakdown && (
                        <div className="p-4">
                          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2 px-2">
                            <div className="col-span-1">Pos</div>
                            <div className="col-span-4">You Predicted</div>
                            <div className="col-span-4">Actual</div>
                            <div className="col-span-3 text-right">Pts</div>
                          </div>
                          {lockedPrediction.breakdown.map((score) => {
                            const predictedDriver = driverById[score.predictedDriverId];
                            const actualDriver = score.actualDriverId ? driverById[score.actualDriverId] : null;

                            return (
                              <div
                                key={score.position}
                                className="grid grid-cols-12 gap-2 py-2 px-2 border-b border-gray-100 last:border-0 items-center"
                              >
                                <div className="col-span-1 text-sm font-medium text-gray-600">
                                  P{score.position}
                                </div>
                                <div className="col-span-4 text-sm">
                                  {predictedDriver
                                    ? `${predictedDriver.familyName}`
                                    : <span className="text-gray-400">-</span>}
                                </div>
                                <div className="col-span-4 text-sm">
                                  {actualDriver
                                    ? `${actualDriver.familyName}`
                                    : <span className="text-gray-400">-</span>}
                                </div>
                                <div className="col-span-3 text-right">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(
                                      score.points
                                    )}`}
                                  >
                                    {getScoreIcon(score.points)} +{score.points}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded bg-green-100 text-green-600 text-center">✓</span>
              Exact
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded bg-yellow-100 text-yellow-600 text-center">↕</span>
              Off by 1
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded bg-red-100 text-red-600 text-center">✗</span>
              Wrong
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPredictionsPanel;
