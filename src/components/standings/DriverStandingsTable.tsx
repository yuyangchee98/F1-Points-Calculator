import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { DriverStanding } from '../../types';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({ standings }) => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  const animationOptions = useMemo(() => ({
    getItemId: (standing: DriverStanding) => standing.driverId,
    compareItems: (current: DriverStanding, prev: DriverStanding) => {
      return current.driverId === prev.driverId;
    }
  }), []);

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
            <tr className="text-ink-muted">
              <th className="w-12 text-left py-2 px-2 font-medium text-2xs uppercase tracking-wider">Pos</th>
              <th className="text-left py-2 font-medium text-2xs uppercase tracking-wider">Driver</th>
              <th className="text-right py-2 pr-2 font-medium text-2xs uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const driver = driverById[standing.driverId];
              if (!driver) return null;

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
                  <td className="py-3 px-2 text-center font-bold text-ink-secondary w-12 tnum font-display">
                    <div className="flex flex-col items-center">
                      <span>{standing.position}</span>
                      {standing.positionChange !== 0 && (
                        <span
                          className={`text-xs font-bold ${
                            standing.positionChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {standing.positionChange > 0 ? '↑' : '↓'}{Math.abs(standing.positionChange)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div
                        className="h-4 w-1 mr-2 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />
                      <div>
                        <div className="font-medium text-ink">{getDriverLastName(driver.id)}</div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`py-3 px-2 font-bold text-right text-ink tnum font-display ${animatedDrivers[standing.driverId] ? 'animate-points-update' : ''}`}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>{standing.points} pts</span>
                      {standing.predictionPointsGained > 0 && (
                        <span className="text-2xs font-semibold text-success bg-green-50 px-1.5 py-0.5 rounded-sm tnum">
                          +{standing.predictionPointsGained}
                        </span>
                      )}
                    </div>
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