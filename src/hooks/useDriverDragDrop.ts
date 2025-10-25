import { useCallback, useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DriverDragItem, ItemTypes } from '../types/dragTypes';
import { moveDriver } from '../store/slices/gridSlice';
import { calculateResults } from '../store/slices/resultsSlice';
import { toastService } from '../components/common/ToastContainer';
import { selectDriversByIdMap, selectTeamsByIdMap } from '../store/selectors/dataSelectors';
import useAppDispatch from './useAppDispatch';
import { trackDriverDrop, GA_EVENTS, trackEvent } from '../utils/analytics';

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

  // Get races from the store
  const races = useSelector((state: RootState) => state.races.list);
  
  // Add a ref to track recent drops to prevent duplicate notifications
  const recentDropRef = useRef<{driverId: string, timestamp: number} | null>(null);

  const handleDrop = useCallback((item: DriverDragItem) => {
    const { driverId, sourceRaceId, sourcePosition } = item;
    
    // Check if this is a duplicate drop event (e.g., from a swap)
    const now = Date.now();
    if (recentDropRef.current && 
        recentDropRef.current.driverId === driverId && 
        now - recentDropRef.current.timestamp < 300) {
      // Ignore duplicate drop events happening within 300ms
      return;
    }
    
    // Mark this drop as processed
    recentDropRef.current = { driverId, timestamp: now };
    
    // If the driver is already in this position, do nothing
    if (currentDriverId === driverId) return;
    
    // Get driver objects for better messages
    const currentDriver = currentDriverId ? driverById[currentDriverId] : null;
    const newDriver = driverById[driverId];

    // Get team color for toast styling (team IDs now use hyphens matching API format)
    const teamColor = newDriver ? teamById[newDriver.team]?.color || '#ccc' : '#ccc';
    
    // Get race names for better context in notifications
    const currentRace = races.find(r => r.id === raceId);
    const sourceRace = sourceRaceId ? races.find(r => r.id === sourceRaceId) : null;
    const currentRaceName = currentRace?.name || 'Unknown Race';
    const sourceRaceName = sourceRace?.name || 'Unknown Race';
    
    // We're moving from one position to another within the same race (potential swap)
    if (sourceRaceId && sourcePosition && sourceRaceId === raceId && currentDriverId) {
      // This will be a swap
      if (currentDriver && newDriver) {
        toastService.addToast(
          `${newDriver.givenName} ${newDriver.familyName} swapped with ${currentDriver.givenName} ${currentDriver.familyName} at P${position} in ${currentRaceName}`,
          'info',
          3000,
          teamColor
        );
      }
    } 
    // Moving between different races (cross-race movement)
    else if (sourceRaceId && sourceRaceId !== raceId) {
      if (newDriver) {
        if (currentDriverId) {
          // Replacing a driver in a different race
          toastService.addToast(
            `${newDriver.givenName} ${newDriver.familyName} moved from ${sourceRaceName} P${sourcePosition} to ${currentRaceName} P${position}` +
            (currentDriver ? `, replacing ${currentDriver.givenName} ${currentDriver.familyName}` : ''),
            'warning',
            3000,
            teamColor
          );
        } else {
          // Moving to an empty slot in a different race
          toastService.addToast(
            `${newDriver.givenName} ${newDriver.familyName} moved from ${sourceRaceName} P${sourcePosition} to ${currentRaceName} P${position}`,
            'info',
            3000,
            teamColor
          );
        }
      }
    }
    // A driver is being placed on an occupied position (from outside the grid)
    else if (currentDriverId && (!sourceRaceId || !sourcePosition)) {
      if (currentDriver && newDriver) {
        // Show toast notification about the replacement
        toastService.addToast(
          `${currentDriver.givenName} ${currentDriver.familyName} was replaced by ${newDriver.givenName} ${newDriver.familyName} in ${currentRaceName} P${position}`,
          'warning',
          3000,
          teamColor
        );
      }
    }
    // Driver is being placed from the selection pool to an empty slot
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
    // Simple move within the same race (to an empty slot)
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
    
    // Use the unified moveDriver action
    dispatch(moveDriver({
      driverId,
      toRaceId: raceId,
      toPosition: position,
      fromRaceId: sourceRaceId,
      fromPosition: sourcePosition
    }));
    
    // Track the drop event
    trackDriverDrop(driverId, raceId, position);
    
    // Recalculate results
    dispatch(calculateResults());

    return { driverId, raceId, position };
  }, [raceId, position, currentDriverId, dispatch, races, driverById, teamById, recentDropRef]);
  
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
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        // Track drag start when drag ends successfully
        trackEvent(GA_EVENTS.DRIVER_ACTIONS.DRAG_START, 'Driver Predictions', driverId);
      }
    },
  }), [driverId, raceId, position]);
  
  return {
    drag,
    isDragging
  };
}
