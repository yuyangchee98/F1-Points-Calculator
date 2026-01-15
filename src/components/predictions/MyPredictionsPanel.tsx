import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { openAuthModal } from '../../store/slices/authSlice';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import {
  selectOverallAccuracy,
  selectLockedRaceCount,
  selectScoredRaceCount,
  selectNextRaceToLock,
  selectAwaitingResultsRaces,
  selectScoredRaces,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useCountdown } from '../../hooks/useCountdown';

const getDriverCode = (driver: { code?: string; familyName: string } | undefined): string => {
  if (!driver) return '---';
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
};

interface MyPredictionsPanelProps {
  onClose: () => void;
  onLockRace: (raceId: string) => void;
}

const Countdown: React.FC<{ date: string }> = ({ date }) => {
  const countdown = useCountdown(date);
  if (!countdown || countdown.isPast) return null;
  return <span className="text-gray-400">{countdown.formatted}</span>;
};

const MyPredictionsPanel: React.FC<MyPredictionsPanelProps> = ({
  onClose,
  onLockRace,
}) => {
  const dispatch = useAppDispatch();
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const overallAccuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const scoredRaces = useSelector(selectScoredRaces);
  const driverById = useSelector(selectDriversByIdMap);
  const gridPositions = useSelector((state: RootState) => state.grid.positions);

  const nextRacePositions = nextRaceToLock
    ? gridPositions
        .filter(p => p.raceId === nextRaceToLock.id && p.driverId)
        .sort((a, b) => a.position - b.position)
    : [];

  const filledCount = nextRacePositions.length;

  const formatName = (name: string) =>
    name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const isNewUser = lockedCount === 0;

  // Not logged in - show sign-in prompt
  if (!user?.id) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lock & Score
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Sign in to lock your predictions before races start and track your accuracy over the season.
            </p>

            <button
              onClick={() => {
                onClose();
                dispatch(openAuthModal('signup'));
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Sign in to get started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New user / intro state
  if (isNewUser) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
          <div className="p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Compete with Fans
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Lock predictions before races to get scored
            </p>

            {/* 3-step explanation */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Predict</div>
                  <div className="text-xs text-gray-500">Drag drivers to set finishing positions</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Lock</div>
                  <div className="text-xs text-gray-500">Submit before race starts (can't change after)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Score</div>
                  <div className="text-xs text-gray-500">See accuracy vs real results & climb the leaderboard</div>
                </div>
              </div>
            </div>

            {/* Next race */}
            {nextRaceToLock && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                    {nextRaceToLock.date && (
                      <div className="text-sm text-amber-700 font-medium">
                        ⏰ Locks in <Countdown date={nextRaceToLock.date} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {filledCount > 0 ? (
                    <span className="text-green-600">✓ {filledCount} of 22 positions filled</span>
                  ) : (
                    <span>No positions filled yet</span>
                  )}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => filledCount > 0 && nextRaceToLock ? onLockRace(nextRaceToLock.id) : onClose()}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {filledCount > 0 ? 'Lock My Prediction' : 'Set Up Predictions'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Returning user with data
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <span className="text-lg font-semibold text-gray-900">My Predictions</span>
            {scoredCount > 0 && (
              <span className="ml-2 text-sm font-medium text-green-600">{overallAccuracy.percentage}% accuracy</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

          {/* Next Race to Lock - only show if no races awaiting results */}
          {nextRaceToLock && awaitingResults.length === 0 && (
            <div className="px-5 py-4 bg-amber-50">
              <div className="text-xs text-amber-700 uppercase tracking-wide font-medium mb-2">
                Next Race
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                  <div className="text-sm">
                    {nextRaceToLock.date && (
                      <span className="text-amber-700 font-medium">⏰ <Countdown date={nextRaceToLock.date} /></span>
                    )}
                    {filledCount > 0 && (
                      <span className="text-green-600 ml-2">· {filledCount}/22 filled</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => filledCount > 0 ? onLockRace(nextRaceToLock.id) : onClose()}
                  className={filledCount > 0
                    ? "bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    : "text-red-600 hover:text-red-700 font-medium text-sm"
                  }
                >
                  {filledCount > 0 ? 'Lock' : 'Set up'}
                </button>
              </div>
            </div>
          )}

          {/* Awaiting Results - show locked positions */}
          {awaitingResults.length > 0 && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  🔒 Locked
                </span>
                <span className="text-xs text-gray-400">
                  — waiting for race to finish
                </span>
              </div>
              {awaitingResults.map(({ race, lockedPrediction }) => (
                <div key={race.id} className="py-2">
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
          )}

          {/* Scored Results */}
          {scoredRaces.length > 0 && (
            <div className="px-5 py-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                📊 Scored
              </div>
              {scoredRaces.map(({ race, lockedPrediction }) => {
                const isExpanded = expandedRaceId === race.id;
                const score = lockedPrediction.score;
                return (
                  <div key={race.id}>
                    <button
                      onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                      className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 -mx-2 px-2 rounded"
                    >
                      <span className="text-gray-700">{formatName(race.name)}</span>
                      <span className="text-gray-900 font-medium">
                        {score?.percentage}%
                      </span>
                    </button>

                    {isExpanded && lockedPrediction.breakdown && (
                      <div className="pb-3 pt-1">
                        <div className="grid grid-cols-5 gap-x-3 gap-y-1 text-sm">
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
          )}
        </div>

        {/* Footer with leaderboard link */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <a
            href="/leaderboard"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <span>📊</span>
            <span>View Leaderboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MyPredictionsPanel;
