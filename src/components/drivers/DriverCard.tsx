import React from 'react';
import { useSelector } from 'react-redux';
import { Driver } from '../../types';
import { selectTeamsByIdMap } from '../../store/selectors/teamsSelectors';
import { useDriverDrag } from '../../hooks/useDriverDragDrop';
import { getDriverDisplayName } from '../../utils/driverHelper';
import { getDriverLastName } from '../../data/drivers';

interface DriverCardProps {
  driver: Driver;
  isOfficialResult?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  raceId?: string;
  position?: number;
  hideCode?: boolean;
  overrideTeamId?: string | null; // Team ID from race results (historical)
}

const DriverCard: React.FC<DriverCardProps> = ({ 
  driver, 
  isOfficialResult = false,
  isSelected = false,
  onClick,
  raceId,
  position,
  hideCode = false,
  overrideTeamId
}) => {
  // Get teams from Redux
  const teamById = useSelector(selectTeamsByIdMap);

  // Use override team if provided (for historical accuracy), otherwise use driver's current team
  const teamId = overrideTeamId || driver.team;
  const team = teamById[teamId];
  
  // Set up drag source if we're in a grid position
  const { drag, isDragging } = useDriverDrag(driver.id, raceId, position);
  
  return (
    <div
      ref={drag}
      className={`
        driver-card flex items-center justify-between rounded-md overflow-hidden
        ${isSelected ? 'selected' : ''}
        ${isOfficialResult ? 'official-result-styling' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      data-driver-id={driver.id}
      data-driver-name={driver.name}
      data-team={driver.team}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${team?.color || '#ccc'}`,
        cursor: 'grab'
      }}
    >
      {/* Team color gradient overlay */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1/3 opacity-10" 
        style={{ 
          background: `linear-gradient(to right, ${team?.color || '#ccc'} 0%, transparent 100%)`
        }}
      />

      {/* Driver name and team */}
      <div className="flex flex-col ml-3 flex-grow">
        <span className="text-sm font-bold">
          {getDriverDisplayName(driver)}
        </span>
        <span className="text-xs text-gray-600" style={{ color: team?.color || '#555' }}>
          {team?.name || driver.team}
        </span>
      </div>

      {/* Driver code (3 letters) */}
      {!hideCode && (
        <div 
          className="flex-shrink-0 bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded mr-2"
          style={{ 
            backgroundColor: team?.color || '#555',
            minWidth: '40px',
            textAlign: 'center'
          }}
        >
          {getDriverLastName(driver.id).slice(0, 3).toUpperCase()}
        </div>
      )}

    </div>
  );
};

export default DriverCard;