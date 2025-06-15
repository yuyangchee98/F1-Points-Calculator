import React from 'react';
import { useSelector } from 'react-redux';
import { getPointsForPositionWithSystem } from '../../data/pointsSystems';
import { RootState } from '../../store';

interface PointsColumnProps {
  points: number;
  selectedRace?: string | null;
}

const PointsColumn: React.FC<PointsColumnProps> = ({ points, selectedRace }) => {
  // Get the selected race from UI state if not provided
  const selectedRaceFromState = useSelector((state: RootState) => state.ui.selectedRace);
  const selectedPointsSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const activeRaceId = selectedRace || selectedRaceFromState;
  
  // Get all races to determine if the selected one is a sprint
  const races = useSelector((state: RootState) => state.races.list);
  const selectedRaceObj = races.find(race => race.id === activeRaceId);
  
  // Determine if we should show sprint points
  const isSprint = selectedRaceObj?.isSprint || false;
  // For points display, we need to map the position (1-20) to get the actual points
  // The 'points' prop here is actually the position number
  const position = points;
  const displayPoints = position > 0 
    ? getPointsForPositionWithSystem(position, isSprint, selectedPointsSystem)
    : 0;

  return (
    <div 
      className={`points flex items-center justify-center ${isSprint ? 'sprint-points' : ''}`}
      data-points={displayPoints}
      title={isSprint ? 'Sprint Race Points' : 'Race Points'}
    >
      {displayPoints > 0 ? `${displayPoints} pts` : '-'}
    </div>
  );
};

export default PointsColumn;