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

const getDriverCode = (driver: { code?: string; familyName: string } | undefined): string => {
  if (!driver) return '---';
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
};

interface MyPredictionsPanelProps {
  onClose: () => void;
  onLockRace: (raceId: string) => void;
  onUnlockRace: (raceId: string) => void;
}

const Countdown: React.FC<{ date: string }> = ({ date }) => {
  const countdown = useCountdown(date);
  if (!countdown || countdown.isPast) return <span className="text-gray-400">Started</span>;
  return <span className="text-gray-400">{countdown.formatted}</span>;
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
  const gridPositions = useSelector((state: RootState) => state.grid.positions);

  const nextRacePositions = nextRaceToLock
    ? gridPositions
        .filter(p => p.raceId === nextRaceToLock.id && p.position <= 10)
        .sort((a, b) => a.position - b.position)
    : [];

  const filledCount = nextRacePositions.filter(p => p.driverId).length;

  const formatName = (name: string) =>
    name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const maxScore = scoredCount * 30;
  const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">

        {/* Header - minimal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <div className="text-lg font-semibold text-gray-900">Predictions</div>
            <div className="text-sm text-gray-400">
              {totalScore} pts{scoredCount > 0 && ` · ${accuracy}%`} · {lockedCount}/{races.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Next Race to Lock */}
          {nextRaceToLock && (
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Next Race
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">{formatName(nextRaceToLock.name)}</div>
                  {nextRaceToLock.date && <Countdown date={nextRaceToLock.date} />}
                </div>
                <button
                  onClick={() => filledCount > 0 ? onLockRace(nextRaceToLock.id) : onClose()}
                  className={filledCount > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    : "text-blue-600 hover:text-blue-700 font-medium text-sm"
                  }
                >
                  {filledCount > 0 ? '🔒 Lock' : 'Set up →'}
                </button>
              </div>

              {filledCount > 0 ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {nextRacePositions.map((pos) => {
                      const driver = pos.driverId ? driverById[pos.driverId] : null;
                      return (
                        <div key={pos.position} className="text-center">
                          <div className="text-[10px] text-gray-400 mb-0.5">P{pos.position}</div>
                          <div className={`text-sm font-medium ${driver ? 'text-gray-800' : 'text-gray-300'}`}>
                            {driver ? getDriverCode(driver) : '---'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filledCount < 10 && (
                    <div className="text-xs text-amber-600 mt-2 text-center">
                      {filledCount}/10 positions filled
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  Drag drivers into the grid to make predictions
                </div>
              )}
            </div>
          )}

          {/* Awaiting Results */}
          {awaitingResults.length > 0 && (
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Awaiting Results
              </div>
              {awaitingResults.map(({ race }) => (
                <div key={race.id} className="flex items-center justify-between py-1.5">
                  <span className="text-gray-700">{formatName(race.name)}</span>
                  <button
                    onClick={() => onUnlockRace(race.id)}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    Unlock
                  </button>
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
                return (
                  <div key={race.id}>
                    <button
                      onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                      className="w-full flex items-center justify-between py-2 text-left"
                    >
                      <span className="text-gray-700">{formatName(race.name)}</span>
                      <span className="text-gray-900 font-medium">
                        {lockedPrediction.score}<span className="text-gray-400 font-normal">/30</span>
                      </span>
                    </button>

                    {isExpanded && lockedPrediction.breakdown && (
                      <div className="pb-3 pt-1">
                        <div className="grid grid-cols-5 gap-x-3 gap-y-1 text-sm">
                          {lockedPrediction.breakdown.map((score) => {
                            const driver = driverById[score.predictedDriverId];
                            return (
                              <div key={score.position} className="flex items-center gap-1">
                                <span className={
                                  score.points === 3 ? 'text-green-600' :
                                  score.points === 1 ? 'text-yellow-600' : 'text-gray-300'
                                }>
                                  {score.points === 3 ? '●' : score.points === 1 ? '◐' : '○'}
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

          {/* Empty state */}
          {!nextRaceToLock && awaitingResults.length === 0 && scoredRaces.length === 0 && (
            <div className="px-5 py-12 text-center text-gray-400">
              No predictions yet
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Lock your predictions before the race to get scored
        </div>
      </div>
    </div>
  );
};

export default MyPredictionsPanel;
