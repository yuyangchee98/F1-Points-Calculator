import React, { useMemo } from 'react';
import { DriverStanding } from '../../types';
import { driverById } from '../../data/drivers';
import { teamById } from '../../data/teams';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';
import { normalizeTeamId } from '../../utils/teamHelper';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({ standings }) => {
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
              
              // Get the team color
              const teamId = normalizeTeamId(driver.team);
              const teamColor = teamById[teamId]?.color || '#ccc';
              
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
                        <div className="font-medium text-gray-800">{driver.name}</div>
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