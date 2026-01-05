import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  selectNextRaceToLock,
} from '../../store/selectors/lockedPredictionsSelectors';
import { useCountdown } from '../../hooks/useCountdown';

interface SmartBannerProps {
  onLockClick: (raceId: string) => void;
  onViewClick: (raceId: string) => void;
  onUnlockClick: (raceId: string) => void;
  onSeeBreakdownClick: (raceId: string) => void;
}

const SmartBanner: React.FC<SmartBannerProps> = ({
  onLockClick,
  onViewClick,
  onUnlockClick,
  onSeeBreakdownClick,
}) => {
  const races = useSelector((state: RootState) => state.seasonData.races);
  const lockedPredictions = useSelector((state: RootState) => state.lockedPredictions.lockedPredictions);

  // Find the most relevant race to show
  const nextRaceToLock = useSelector(selectNextRaceToLock);

  // Find the most recently completed race with a locked prediction
  const recentlyCompletedLocked = races
    .filter(race => race.completed && lockedPredictions[race.id]?.score !== undefined)
    .sort((a, b) => b.order - a.order)[0];

  // Find locked but not yet started races
  const lockedUpcoming = races
    .filter(race => !race.completed && lockedPredictions[race.id])
    .sort((a, b) => a.order - b.order)[0];

  // Determine which race to show in banner
  const raceToShow = recentlyCompletedLocked || lockedUpcoming || nextRaceToLock;

  const countdown = useCountdown(raceToShow?.date);

  if (!raceToShow) {
    return null;
  }

  const formatRaceName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const lockedPrediction = lockedPredictions[raceToShow.id];
  const isCompleted = raceToShow.completed;
  const isLocked = !!lockedPrediction;
  const hasScore = lockedPrediction?.score !== undefined;

  // State A: Race completed with score
  if (isCompleted && hasScore) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <span className="font-semibold text-gray-800">
              {formatRaceName(raceToShow.name)}: {lockedPrediction.score}/30 pts!
            </span>
          </div>
        </div>
        <button
          onClick={() => onSeeBreakdownClick(raceToShow.id)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          See Breakdown
        </button>
      </div>
    );
  }

  // State B: Locked, waiting for race
  if (isLocked && !isCompleted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <span className="font-semibold text-gray-800">
              {formatRaceName(raceToShow.name)} - Locked
            </span>
            {countdown && !countdown.isPast && (
              <span className="text-gray-500 text-sm ml-2">
                Starts in {countdown.formatted}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewClick(raceToShow.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            View
          </button>
          {countdown && !countdown.isPast && (
            <button
              onClick={() => onUnlockClick(raceToShow.id)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Unlock
            </button>
          )}
        </div>
      </div>
    );
  }

  // State C: Not locked, race upcoming
  if (!isLocked && !isCompleted && countdown && !countdown.isPast) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏁</span>
          <div>
            <span className="font-semibold text-gray-800">
              {formatRaceName(raceToShow.name)}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              starts in {countdown.formatted}
            </span>
          </div>
        </div>
        <button
          onClick={() => onLockClick(raceToShow.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          Lock Prediction
          <span>→</span>
        </button>
      </div>
    );
  }

  // State D: Missed deadline
  if (!isLocked && countdown?.isPast && !isCompleted) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <span className="text-gray-600">
            Missed {formatRaceName(raceToShow.name)} - No prediction locked
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default SmartBanner;
