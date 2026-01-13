import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { Race } from '../../types';
import { selectDriversByIdMap, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { lockPrediction, clearLockError } from '../../store/slices/lockedPredictionsSlice';
import { useCountdown, formatRaceDate } from '../../hooks/useCountdown';
import { LockedPosition, UserIdentifier } from '../../api/predictions';
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
  const { user } = useSelector((state: RootState) => state.auth);
  const positions = useSelector((state: RootState) => state.grid.positions);
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);
  const isLocking = useSelector((state: RootState) => state.lockedPredictions.isLocking);
  const lockError = useSelector((state: RootState) => state.lockedPredictions.error);

  // Only allow locking for logged-in users
  const getIdentifier = (): UserIdentifier | null => {
    if (user?.id) return { userId: user.id };
    return null;
  };

  // Clear any previous error when modal opens
  useEffect(() => {
    dispatch(clearLockError());
  }, [dispatch]);

  const countdown = useCountdown(race.date);

  // Get ALL filled positions for this race
  const racePositions = positions
    .filter(p => p.raceId === race.id && p.driverId)
    .sort((a, b) => a.position - b.position);

  const formatRaceName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLock = async () => {
    const identifier = getIdentifier();
    if (!identifier) return;

    const lockedPositions: LockedPosition[] = racePositions
      .filter(p => p.driverId)
      .map(p => ({
        position: p.position,
        driverId: p.driverId!,
      }));

    try {
      await dispatch(lockPrediction({
        identifier,
        season: getActiveSeason(),
        raceId: race.id,
        positions: lockedPositions,
      })).unwrap();
      onSuccess();
    } catch (error) {
      // Error handled by slice
    }
  };

  const filledPositions = racePositions.length;

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
            {filledPositions} position{filledPositions !== 1 ? 's' : ''} to lock:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            {racePositions.map((gridPos, index) => {
              const driver = gridPos.driverId ? driverById[gridPos.driverId] : null;

              return (
                <div
                  key={gridPos.position}
                  className={`flex items-center gap-3 py-2 ${
                    index < racePositions.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <span className="w-8 text-sm font-bold text-gray-500">P{gridPos.position}</span>
                  <span className="font-medium text-gray-800">
                    {driver?.givenName} {driver?.familyName}
                  </span>
                  {driver?.team && teamById[driver.team] && (
                    <span className="text-xs text-gray-400">{teamById[driver.team].name}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Score = % of these positions you get exactly right
          </div>

          {race.date && countdown && !countdown.isPast && (
            <div className="text-sm text-gray-600 mb-4">
              <strong>Race starts:</strong> {formatRaceDate(race.date)} (in {countdown.formatted})
            </div>
          )}

          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-4">
            Final step — no edits after locking.
          </div>

          {lockError && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">
              Failed to lock. Please try again later.
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
