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
  // Consolidate points for drivers with team changes (Tsunoda and Lawson)
  const consolidatedStandings = useMemo(() => {
    // Create a map to group by base driver (without team)
    const driverPointsMap: Record<string, {
      points: number,
      driverId: string,
      teams: string[],
      position: number
    }> = {};
    
    // First pass: collect all points for each base driver
    standings.forEach(standing => {
      const driver = driverById[standing.driverId];
      if (!driver) return;
      
      let baseDriverId = standing.driverId;
      // Driver name is handled later in rendering
      
      // Handle Tsunoda and Lawson specially
      if (standing.driverId.includes('tsunoda')) {
        baseDriverId = 'tsunoda';
      } else if (standing.driverId.includes('lawson')) {
        baseDriverId = 'lawson';
      }
      
      // Initialize or update driver points
      if (!driverPointsMap[baseDriverId]) {
        driverPointsMap[baseDriverId] = {
          points: 0,
          driverId: standing.driverId,
          teams: [],
          position: standing.position
        };
      }
      
      // Add points
      driverPointsMap[baseDriverId].points += standing.points;
      
      // Keep the better position
      if (standing.position < driverPointsMap[baseDriverId].position) {
        driverPointsMap[baseDriverId].position = standing.position;
      }
      
      // Add team if not already present
      if (!driverPointsMap[baseDriverId].teams.includes(driver.team)) {
        driverPointsMap[baseDriverId].teams.push(driver.team);
      }
      
      // For multi-team drivers (Tsunoda/Lawson), use the latest driver ID
      // This ensures we link to the correct driver data
      if (baseDriverId === 'tsunoda' || baseDriverId === 'lawson') {
        // Use the current driver ID as default
        driverPointsMap[baseDriverId].driverId = standing.driverId;
      }
    });
    
    // Convert back to array and sort
    const result = Object.values(driverPointsMap)
      .sort((a, b) => b.points - a.points)
      .map((data, index) => ({
        driverId: data.driverId,
        points: data.points,
        position: index + 1, // Re-number positions based on new sort
        teams: data.teams
      }));
      
    return result;
  }, [standings]);
  
  // Memoize animation options to prevent recreating functions on each render
  const animationOptions = useMemo(() => ({
    getItemId: (standing: typeof consolidatedStandings[0]) => standing.driverId,
    compareItems: (current: typeof consolidatedStandings[0], prev: typeof consolidatedStandings[0]) => {
      // Special handling for Tsunoda and Lawson who have team changes
      const currentBase = current.driverId.includes('tsunoda') ? 'tsunoda' : 
                         current.driverId.includes('lawson') ? 'lawson' : 
                         current.driverId;
      const prevBase = prev.driverId.includes('tsunoda') ? 'tsunoda' : 
                      prev.driverId.includes('lawson') ? 'lawson' : 
                      prev.driverId;
      return currentBase === prevBase;
    }
  }), []);
  
  // Use custom hook for animations with special comparison logic for Tsunoda and Lawson
  const animatedDrivers = useStandingsAnimation(consolidatedStandings, animationOptions);
  
  return (
    <div className="overflow-hidden rounded-lg">
      {consolidatedStandings.length === 0 ? (
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
            {consolidatedStandings.map((standing) => {
              const driver = driverById[standing.driverId];
              if (!driver) return null;
              
              // For drivers with team changes (multiple teams), show a special indicator
              const hasMultipleTeams = (standing.teams && standing.teams.length > 1);
              
              // Get the team colors to display
              const teamColors = hasMultipleTeams
                ? standing.teams.map(team => {
                    const teamId = normalizeTeamId(team);
                    return teamById[teamId]?.color || '#ccc';
                  })
                : [teamById[normalizeTeamId(driver.team)]?.color || '#ccc'];
              
              // Get display name - for standings table, show first name only for Tsunoda/Lawson
              const displayName = (driver.id.includes('tsunoda') || driver.id.includes('lawson')) 
                                  ? driver.name.split(' ')[0]
                                  : driver.name;
              
              // Team display for multi-team drivers
              const teamDisplay = hasMultipleTeams
                ? standing.teams.join(' / ')
                : driver.team;
              
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
                      {hasMultipleTeams ? (
                        <div className="flex mr-2">
                          {teamColors.map((color, i) => (
                            <div 
                              key={i}
                              className={`h-5 w-2 ${i > 0 ? '-ml-1' : ''} rounded-sm`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="h-5 w-3 mr-2 rounded-sm"
                          style={{ backgroundColor: teamColors[0] }}
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{displayName}</div>
                        {hasMultipleTeams && (
                          <div className="text-xs text-gray-500">{teamDisplay}</div>
                        )}
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