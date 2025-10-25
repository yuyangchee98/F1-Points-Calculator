import React from 'react';
import { useSelector } from 'react-redux';
import { DriverStanding } from '../../types';
import { selectDriversByIdMap, getDriverLastName } from '../../store/selectors/driversSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/teamsSelectors';

interface PositionColumnProps {
  position: number;
  mode?: 'position' | 'standings';
  standings?: DriverStanding[];
}

const PositionColumn: React.FC<PositionColumnProps> = ({ position, mode = 'position', standings = [] }) => {
  // Get drivers and teams from Redux
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  // In standings mode, find the driver at this championship position
  const standingDriver = mode === 'standings' && standings[position - 1];
  const driver = standingDriver ? driverById[standingDriver.driverId] : null;
  const team = driver ? teamById[driver.team] : null;
  const teamColor = team?.color || '#666666';

  return (
    <div
      className="position sticky left-0 z-10 flex items-center justify-center"
      data-position={position}
      title={mode === 'standings' && driver && standingDriver ? `${driver.givenName} ${driver.familyName} - ${standingDriver.points} pts` : `Position ${position}`}
    >
      {mode === 'position' ? (
        <span className="font-bold text-gray-700">{position}</span>
      ) : (
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-[10px] text-gray-500 font-semibold">{position}</span>
          {driver && (
            <>
              <span 
                className="text-xs font-bold"
                style={{ color: teamColor }}
              >
                {getDriverLastName(driver.id).slice(0, 3).toUpperCase()}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                {standingDriver && standingDriver.points}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionColumn;