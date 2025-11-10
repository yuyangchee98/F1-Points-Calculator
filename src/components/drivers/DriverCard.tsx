import React from 'react';
import { useSelector } from 'react-redux';
import { Driver } from '../../types';
import { RootState } from '../../store';
import { selectTeamsByIdMap, getDriverLastName, getDriverDisplayName } from '../../store/selectors/dataSelectors';
import { useDriverDrag } from '../../hooks/useDriverDragDrop';

interface DriverCardProps {
  driver: Driver;
  isOfficialResult?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  raceId?: string;
  position?: number;
  hideCode?: boolean;
  overrideTeamId?: string | null;
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
  const teamById = useSelector(selectTeamsByIdMap);
  const positions = useSelector((state: RootState) => state.grid.positions);

  const teamId = overrideTeamId || driver.team;
  const team = teamById[teamId];

  const { drag, isDragging } = useDriverDrag(driver.id, raceId, position);

  // Check if this driver has the fastest lap for this race
  const hasFastestLap = raceId && position
    ? positions.find(p => p.raceId === raceId && p.position === position)?.hasFastestLap || false
    : false;

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
      data-driver-name={`${driver.givenName} ${driver.familyName}`}
      data-team={driver.team}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${team?.color || '#ccc'}`,
        cursor: 'grab'
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 opacity-10"
        style={{
          background: `linear-gradient(to right, ${team?.color || '#ccc'} 0%, transparent 100%)`,
          zIndex: 0
        }}
      />

      <div className="flex flex-col ml-3 flex-grow relative" style={{ zIndex: 1 }}>
        <span className="text-sm font-bold flex items-center gap-1">
          {getDriverDisplayName(driver)}
        </span>
        <span className="text-xs text-gray-600" style={{ color: team?.color || '#555' }}>
          {team?.name || driver.team}
        </span>
      </div>

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