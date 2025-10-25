import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DriverStanding } from '../../types';
import { selectDriversByIdMap, getDriverLastName } from '../../store/selectors/driversSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/teamsSelectors';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({ standings }) => {
  // Get drivers and teams from Redux
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  // Memoize animation options to prevent recreating functions on each render
  const animationOptions = useMemo(() => ({
    getItemId: (standing: DriverStanding) => standing.driverId,
    compareItems: (current: DriverStanding, prev: DriverStanding) => {
      return current.driverId === prev.driverId;
    }
  }), []);

  // Use custom hook for animations
  const animatedDrivers = useStandingsAnimation(standings, animationOptions);
  
  return (
    <div className="overflow-hidden rounded-lg">
      {standings.length === 0 ? (
        <div className="text-center p-4 rounded text-gray-300">
          No driver standings available yet. Try placing drivers in race positions.
        </div>
      ) : (
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="text-gray-300 border-gray-600">
              <th className="w-12 text-left py-2 font-normal text-sm">Pos</th>
              <th className="text-left py-2 font-normal text-sm">Driver</th>
              <th className="text-right py-2 pr-2 font-normal text-sm">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const driver = driverById[standing.driverId];
              if (!driver) return null;

              // Get the team color (team IDs now use hyphens matching API format)
              const teamColor = teamById[driver.team]?.color || '#ccc';
              
              return (
                <tr 
                  key={standing.driverId} 
                  className={`
                    hover:bg-gray-50
                    ${animatedDrivers[standing.driverId] === 'up' ? 'animate-position-up' : ''}
                    ${animatedDrivers[standing.driverId] === 'down' ? 'animate-position-down' : ''}
                  `}
                >
                  <td className="py-3 px-2 text-center font-bold text-gray-700 w-12">
                    {standing.position}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div 
                        className="h-5 w-3 mr-2 rounded-sm"
                        style={{ backgroundColor: teamColor }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">{getDriverLastName(driver.id)}</div>
                      </div>
                    </div>
                  </td>
                  <td 
                    className={`py-3 px-2 font-bold text-right text-gray-800 ${animatedDrivers[standing.driverId] ? 'animate-points-update' : ''}`}
                  >
                    {standing.points} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DriverStandingsTable;