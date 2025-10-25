import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Race } from '../../types';
import { RootState } from '../../store';
import { selectDriverAtPosition, selectDriversByIdMap, getDriverLastName } from '../../store/selectors/dataSelectors';
import DriverCard from '../drivers/DriverCard';
import { selectDriver } from '../../store/slices/uiSlice';
import { placeDriver } from '../../store/slices/gridSlice';
import { calculateResults } from '../../store/slices/resultsSlice';
import useAppDispatch from '../../hooks/useAppDispatch';
import { useDriverDrop } from '../../hooks/useDriverDragDrop';

interface RaceColumnProps {
  race: Race;
  position: number;
}

const RaceColumn: React.FC<RaceColumnProps> = ({ race, position }) => {
  const dispatch = useAppDispatch();
  const driverId = useSelector((state: RootState) =>
    selectDriverAtPosition(state, race.id, position)
  );
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const positions = useSelector((state: RootState) => state.grid.positions);
  const driverById = useSelector(selectDriversByIdMap);

  // Animation states
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevDriverId, setPrevDriverId] = useState<string | null>(null);

  // Set up the drop target
  const { drop, isOver, canDrop } = useDriverDrop({
    raceId: race.id,
    position,
  });

  // Detect when a driver is placed and trigger animation
  useEffect(() => {
    if (driverId && driverId !== prevDriverId) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevDriverId(driverId);
  }, [driverId, prevDriverId]);

  // Find the grid position object to determine if it's an official result
  const gridPosition = positions.find(p =>
    p.raceId === race.id && p.position === position
  );
  const isOfficialResult = gridPosition?.isOfficialResult || false;

  // Get the driver object if there's a driver in this position
  const driver = driverId ? driverById[driverId] : null;

  // Handle click on the race slot to place the selected driver
  const handleSlotClick = () => {
    // If we have a driver selected and this is a valid slot
    if (selectedDriverId) {
      dispatch(placeDriver({
        raceId: race.id,
        position,
        driverId: selectedDriverId
      }));
      
      // Update point calculations
      dispatch(calculateResults());
      
      // Clear the selected driver
      dispatch(selectDriver(null));
    }
  };

  // Prepare classes for the race slot
  const slotClasses = [
    'race-slot',
    race.isSprint ? 'sprint' : '',
    // Highlight slots when a driver is selected
    selectedDriverId ? 'highlight-slot' : '',
    // Keep the official-result class for styling only
    isOfficialResult ? 'official-result-styling' : '',
    // Add a class for completed races
    race.completed ? 'completed-race' : '',
    // Animation classes
    isHighlighted ? 'animate-slot-highlight' : '',
    // React DnD classes
    isOver ? 'drag-over' : '',
    canDrop ? 'can-drop' : '',
    selectedDriverId ? 'cursor-pointer' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={slotClasses}
      data-testid="race-slot"
      data-race-id={race.id}
      data-position={position}
      onClick={handleSlotClick}
      ref={drop}
      role="button"
      aria-label={driver ? `Position ${position}: ${getDriverLastName(driver.id)}` : `Empty position ${position}`}
      tabIndex={0}
    >
      {driver && (
        <div className="animate-placement grid-card-wrapper">
          <DriverCard 
            driver={driver}
            isOfficialResult={isOfficialResult}
            raceId={race.id}
            position={position}
            hideCode={true}
            overrideTeamId={gridPosition?.teamId}
          />
        </div>
      )}
    </div>
  );
};

export default RaceColumn;