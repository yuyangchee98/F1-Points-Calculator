import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
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
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const overallAccuracy = useSelector(selectOverallAccuracy);
  const lockedCount = useSelector(selectLockedRaceCount);
  const scoredCount = useSelector(selectScoredRaceCount);
  const nextRaceToLock = useSelector(selectNextRaceToLock);
  const awaitingResults = useSelector(selectAwaitingResultsRaces);
  const scoredRaces = useSelector(selectScoredRaces);
  const driverById = useSelector(selectDriversByIdMap);
  const races = useSelector((state: RootState) => state.seasonData.races);
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lock & Score
            </h2>

            {/* Explanation */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              The grid is your sandbox—change it anytime.
              But lock before a race starts, and we'll score you against the real results.
            </p>

            {/* Next race */}
            {nextRaceToLock && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                    {nextRaceToLock.date && <Countdown date={nextRaceToLock.date} />}
                  </div>
                </div>
                {filledCount > 0 && (
                  <div className="text-sm text-gray-500 mt-2">
                    {filledCount} position{filledCount !== 1 ? 's' : ''} ready
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => filledCount > 0 && nextRaceToLock ? onLockRace(nextRaceToLock.id) : onClose()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {filledCount > 0 ? 'Lock my predictions' : 'Set up predictions'}
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
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">Lock & Score</span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-300 hover:text-gray-500 text-sm"
              title="How it works"
            >
              ?
            </button>
          </div>
          <div className="flex items-center gap-3">
            {scoredCount > 0 && (
              <span className="text-sm text-gray-500">{overallAccuracy.percentage}%</span>
            )}
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Info tooltip */}
        {showInfo && (
          <div className="px-5 py-3 bg-blue-50 text-sm text-blue-800 border-b border-blue-100">
            The grid is your sandbox. Lock before a race starts, and we'll score you against the real results.
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

          {/* Next Race to Lock - only show if no races awaiting results */}
          {nextRaceToLock && awaitingResults.length === 0 && (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                  <div className="text-sm text-gray-400">
                    {nextRaceToLock.date && <Countdown date={nextRaceToLock.date} />}
                    {filledCount > 0 && <span> · {filledCount} ready</span>}
                  </div>
                </div>
                <button
                  onClick={() => filledCount > 0 ? onLockRace(nextRaceToLock.id) : onClose()}
                  className={filledCount > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    : "text-blue-600 hover:text-blue-700 font-medium text-sm"
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
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Awaiting Results
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Score appears after race finishes.
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
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Results
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
      </div>
    </div>
  );
};

export default MyPredictionsPanel;
