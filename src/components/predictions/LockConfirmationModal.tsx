import React from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { Race } from '../../types';
import { selectDriversByIdMap } from '../../store/selectors/dataSelectors';
import { lockPrediction } from '../../store/slices/lockedPredictionsSlice';
import { useCountdown, formatRaceDate } from '../../hooks/useCountdown';
import { LockedPosition } from '../../api/predictions';
import { getActiveSeason } from '../../utils/constants';

interface LockConfirmationModalProps {
  race: Race;
  onClose: () => void;
  onSuccess: () => void;
}

const LockConfirmationModal: React.FC<LockConfirmationModalProps> = ({
  race,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const fingerprint = useSelector((state: RootState) => state.predictions.fingerprint);
  const positions = useSelector((state: RootState) => state.grid.positions);
  const driverById = useSelector(selectDriversByIdMap);
  const isLocking = useSelector((state: RootState) => state.lockedPredictions.isLocking);

  const countdown = useCountdown(race.date);

  // Get P1-P10 for this race
  const racePositions = positions
    .filter(p => p.raceId === race.id && p.position <= 10 && p.driverId)
    .sort((a, b) => a.position - b.position);

  const formatRaceName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLock = async () => {
    if (!fingerprint) return;

    const lockedPositions: LockedPosition[] = racePositions
      .filter(p => p.driverId)
      .map(p => ({
        position: p.position,
        driverId: p.driverId!,
      }));

    try {
      await dispatch(lockPrediction({
        fingerprint,
        season: getActiveSeason(),
        raceId: race.id,
        positions: lockedPositions,
      })).unwrap();
      onSuccess();
    } catch (error) {
      // Error handled by slice
    }
  };

  const filledPositions = racePositions.filter(p => p.driverId).length;
  const hasMinPredictions = filledPositions >= 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔒</span>
            <h2 className="text-xl font-bold text-gray-800">
              Lock {formatRaceName(race.name)} Prediction?
            </h2>
          </div>

          <p className="text-gray-600 mb-4">
            Your current P1-P10 predictions:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(position => {
              const gridPos = racePositions.find(p => p.position === position);
              const driver = gridPos?.driverId ? driverById[gridPos.driverId] : null;

              return (
                <div
                  key={position}
                  className={`flex items-center gap-3 py-2 ${
                    position < 10 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <span className="w-8 text-sm font-bold text-gray-500">P{position}</span>
                  {driver ? (
                    <span className="font-medium text-gray-800">
                      {driver.givenName} {driver.familyName}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Empty</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>This is what will be scored after the race.</strong>
              {' '}You can unlock and re-lock until race start.
            </p>
          </div>

          {race.date && countdown && !countdown.isPast && (
            <div className="text-sm text-gray-600 mb-4">
              <strong>Race starts:</strong> {formatRaceDate(race.date)} (in {countdown.formatted})
            </div>
          )}

          {!hasMinPredictions && (
            <div className="bg-yellow-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                You only have {filledPositions} position{filledPositions !== 1 ? 's' : ''} filled.
                Add more predictions for a better score!
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLocking}
            >
              Cancel
            </button>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isLocking || filledPositions === 0}
            >
              {isLocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Locking...
                </>
              ) : (
                <>
                  <span>🔒</span>
                  Lock It
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockConfirmationModal;
