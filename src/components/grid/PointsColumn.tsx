import React from 'react';
import { useSelector } from 'react-redux';
import { getPointsForPosition } from '../../data/points';
import { RootState } from '../../store';

interface PointsColumnProps {
  points: number;
  selectedRace?: string | null;
}

const PointsColumn: React.FC<PointsColumnProps> = ({ points, selectedRace }) => {
  // Get the selected race from UI state if not provided
  const selectedRaceFromState = useSelector((state: RootState) => state.ui.selectedRace);
  const activeRaceId = selectedRace || selectedRaceFromState;
  
  // Get all races to determine if the selected one is a sprint
  const races = useSelector((state: RootState) => state.races.list);
  const selectedRaceObj = races.find(race => race.id === activeRaceId);
  
  // Determine if we should show sprint points
  const isSprint = selectedRaceObj?.isSprint || false;
  // Determine which points to display based on whether a sprint race is selected
  const displayPoints = isSprint 
    ? getPointsForPosition(points > 0 ? points : 20, true) 
    : points;

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