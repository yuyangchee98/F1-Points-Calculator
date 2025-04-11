import React from 'react';
import { Driver } from '../../types';
import { teamById } from '../../data/teams';
import { useDriverDrag } from '../../hooks/useDriverDragDrop';
// formatDriverName not needed here

interface DriverCardProps {
  driver: Driver;
  isOfficialResult?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  raceId?: string;
  position?: number;
}

const DriverCard: React.FC<DriverCardProps> = ({ 
  driver, 
  isOfficialResult = false,
  isSelected = false,
  onClick,
  raceId,
  position
}) => {
  const team = teamById[driver.team.toLowerCase().replace(/\s/g, '-')];
  
  // Set up drag source if we're in a grid position
  const { drag, isDragging } = useDriverDrag(driver.id, raceId, position);
  
  return (
    <div 
      ref={drag}
      className={`
        driver-card flex items-center rounded-md overflow-hidden
        ${isSelected ? 'selected' : ''}
        ${isOfficialResult ? 'official-result-styling' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      data-driver-id={driver.id}
      data-driver-name={driver.name}
      data-team={driver.team}
      data-official-result={isOfficialResult ? 'true' : 'false'}
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

      {/* Driver name */}
      <div className="flex flex-col ml-3">
        <span className="text-sm font-bold">
          {driver.id.includes('tsunoda') ? driver.name.split(' ')[0] :
           driver.id.includes('lawson') ? driver.name.split(' ')[0] :
           driver.name.split(' ')[1]?.toUpperCase() || driver.name}
        </span>
        <span className="text-xs text-gray-500">
          {team?.name || driver.team}
        </span>
      </div>

    </div>
  );
};

export default DriverCard;