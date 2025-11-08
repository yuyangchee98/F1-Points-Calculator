import { useCallback, useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DriverDragItem, ItemTypes } from '../types/dragTypes';
import { moveDriver } from '../store/slices/gridSlice';
import { calculateResults } from '../store/slices/resultsSlice';
import { toastService } from '../components/common/ToastContainer';
import { selectDriversByIdMap, selectTeamsByIdMap } from '../store/selectors/dataSelectors';
import { useAppDispatch } from '../store';
import { trackDriverDrop, incrementPredictionCount, updateUserProperties } from '../utils/analytics';

interface UseDriverDropParams {
  raceId: string;
  position: number;
}

export function useDriverDrop({ raceId, position }: UseDriverDropParams) {
  const dispatch = useAppDispatch();
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);
  const currentDriverId = useSelector((state: RootState) =>
    state.grid.positions.find(p => p.raceId === raceId && p.position === position)?.driverId
  );

  const races = useSelector((state: RootState) => state.seasonData.races);

  const allPositions = useSelector((state: RootState) => state.grid.positions);

  const recentDropRef = useRef<{driverId: string, timestamp: number} | null>(null);

  const handleDrop = useCallback((item: DriverDragItem) => {
    const { driverId, sourceRaceId, sourcePosition } = item;

    const now = Date.now();
    if (recentDropRef.current &&
        recentDropRef.current.driverId === driverId &&
        now - recentDropRef.current.timestamp < 300) {
      return;
    }

    recentDropRef.current = { driverId, timestamp: now };

    if (currentDriverId === driverId) return;

    const currentDriver = currentDriverId ? driverById[currentDriverId] : null;
    const newDriver = driverById[driverId];

    const teamColor = newDriver ? teamById[newDriver.team]?.color || '#ccc' : '#ccc';

    const currentRace = races.find(r => r.id === raceId);
    const sourceRace = sourceRaceId ? races.find(r => r.id === sourceRaceId) : null;
    const currentRaceName = currentRace?.name || 'Unknown Race';
    const sourceRaceName = sourceRace?.name || 'Unknown Race';

    if (sourceRaceId && sourcePosition && sourceRaceId === raceId && currentDriverId) {
      if (currentDriver && newDriver) {
        toastService.addToast(
          `${newDriver.givenName} ${newDriver.familyName} swapped with ${currentDriver.givenName} ${currentDriver.familyName} at P${position} in ${currentRaceName}`,
          'info',
          3000,
          teamColor
        );
      }
    }
    else if (sourceRaceId && sourceRaceId !== raceId) {
      if (newDriver) {
        if (currentDriverId) {
          toastService.addToast(
            `${newDriver.givenName} ${newDriver.familyName} moved from ${sourceRaceName} P${sourcePosition} to ${currentRaceName} P${position}` +
            (currentDriver ? `, replacing ${currentDriver.givenName} ${currentDriver.familyName}` : ''),
            'warning',
            3000,
            teamColor
          );
        } else {
          toastService.addToast(
            `${newDriver.givenName} ${newDriver.familyName} moved from ${sourceRaceName} P${sourcePosition} to ${currentRaceName} P${position}`,
            'info',
            3000,
            teamColor
          );
        }
      }
    }
    else if (currentDriverId && (!sourceRaceId || !sourcePosition)) {
      if (currentDriver && newDriver) {
        toastService.addToast(
          `${currentDriver.givenName} ${currentDriver.familyName} was replaced by ${newDriver.givenName} ${newDriver.familyName} in ${currentRaceName} P${position}`,
          'warning',
          3000,
          teamColor
        );
      }
    }
    else if (!sourceRaceId && !sourcePosition && !currentDriverId) {
      if (newDriver) {
        toastService.addToast(
          `${newDriver.givenName} ${newDriver.familyName} placed in ${currentRaceName} P${position}`,
          'success',
          3000,
          teamColor
        );
      }
    }
    else if (sourceRaceId && sourcePosition && sourceRaceId === raceId) {
      if (newDriver) {
        toastService.addToast(
          `${newDriver.givenName} ${newDriver.familyName} was moved from P${sourcePosition} to P${position} in ${currentRaceName}`,
          'info',
          3000,
          teamColor
        );
      }
    }

    dispatch(moveDriver({
      driverId,
      toRaceId: raceId,
      toPosition: position,
      fromRaceId: sourceRaceId,
      fromPosition: sourcePosition
    }));

    trackDriverDrop(driverId, raceId, position);

    const totalPredictions = incrementPredictionCount();
    const completionRate = Math.round((allPositions.length / 480) * 100);

    updateUserProperties({
      total_predictions: totalPredictions,
      completion_rate: completionRate
    });

    dispatch(calculateResults());

    return { driverId, raceId, position };
  }, [raceId, position, currentDriverId, dispatch, races, driverById, teamById, recentDropRef, allPositions]);
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.DRIVER,
    drop: handleDrop,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return {
    drop,
    isOver,
    canDrop,
    currentDriverId
  };
}

export function useDriverDrag(driverId: string, raceId?: string, position?: number) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.DRIVER,
    item: { 
      type: ItemTypes.DRIVER,
      driverId,
      sourceRaceId: raceId,
      sourcePosition: position
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
    },
  }), [driverId, raceId, position]);
  
  return {
    drag,
    isDragging
  };
}
