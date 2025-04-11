import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
// We use driver standings from Redux store
import { formatDriverName } from '../utils/driverHelper';
import { driverById } from '../data/drivers';

/**
 * A component to display combined driver standings for drivers who switched teams
 * Shows Tsunoda and Lawson with their combined points from both teams
 */
const ConsolidatedDriverStandings: React.FC = () => {
  // Get driver standings from Redux store
  const driverStandings = useSelector((state: RootState) => state.results.driverStandings);
  
  // Create a map to consolidate points for drivers who switched teams
  const consolidatedDriverPoints: Record<string, { points: number, position: number, teams: string[] }> = {};
  
  // Process standings to consolidate points
  driverStandings.forEach(standing => {
    const driverId = standing.driverId.toLowerCase();
    let baseDriverId = driverId;
    
    // Extract base driver ID for Tsunoda and Lawson
    if (driverId.includes('tsunoda')) {
      baseDriverId = 'tsunoda';
    } else if (driverId.includes('lawson')) {
      baseDriverId = 'lawson';
    }
    
    // Initialize if needed
    if (!consolidatedDriverPoints[baseDriverId]) {
      consolidatedDriverPoints[baseDriverId] = {
        points: 0,
        position: standing.position,
        teams: []
      };
    }
    
    // Add points
    consolidatedDriverPoints[baseDriverId].points += standing.points;
    
    // Track best position (lower is better)
    if (standing.position < consolidatedDriverPoints[baseDriverId].position) {
      consolidatedDriverPoints[baseDriverId].position = standing.position;
    }
    
    // Add team if not already present
    const driver = driverById[standing.driverId];
    if (driver && !consolidatedDriverPoints[baseDriverId].teams.includes(driver.team)) {
      consolidatedDriverPoints[baseDriverId].teams.push(driver.team);
    }
  });
  
  // Convert to array and sort by points
  const consolidatedStandings = Object.entries(consolidatedDriverPoints)
    .map(([driverId, data]) => ({
      driverId,
      points: data.points,
      position: data.position,
      teams: data.teams
    }))
    .sort((a, b) => {
      // Sort by points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // If points are equal, use best position
      return a.position - b.position;
    })
    .map((standing, index) => ({
      ...standing,
      position: index + 1 // Reassign positions based on new sort order
    }));
  
  // Filter to only show drivers with multiple teams (Tsunoda and Lawson)
  const driversWithTeamChanges = consolidatedStandings.filter(
    driver => driver.teams.length > 1 || 
              driver.driverId.includes('tsunoda') || 
              driver.driverId.includes('lawson')
  );
  
  if (driversWithTeamChanges.length === 0) {
    return <div className="text-center text-gray-500 py-4">No drivers have changed teams</div>;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Combined Driver Standings</h3>
      <p className="text-sm text-gray-500 mb-2">
        Drivers who changed teams during the season, with combined points from all teams.
      </p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Pos</th>
            <th className="p-2 text-left">Driver</th>
            <th className="p-2 text-left">Teams</th>
            <th className="p-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {driversWithTeamChanges.map(standing => (
            <tr key={standing.driverId} className="border-t border-gray-200">
              <td className="p-2">{standing.position}</td>
              <td className="p-2 font-medium">
                {standing.driverId.includes('tsunoda') ? 'Tsunoda' : 
                 standing.driverId.includes('lawson') ? 'Lawson' : 
                 formatDriverName(standing.driverId)}
              </td>
              <td className="p-2 text-sm">
                {standing.teams.join(' / ')}
              </td>
              <td className="p-2 text-right font-mono">{standing.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsolidatedDriverStandings;
