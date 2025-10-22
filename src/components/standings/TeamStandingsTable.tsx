import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TeamStanding } from '../../types';
import { selectTeamsByIdMap } from '../../store/selectors/teamsSelectors';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';

interface TeamStandingsTableProps {
  standings: TeamStanding[];
}

const TeamStandingsTable: React.FC<TeamStandingsTableProps> = ({ standings }) => {
  // Get teams from Redux
  const teamById = useSelector(selectTeamsByIdMap);

  // Memoize animation options to prevent recreating functions on each render
  const animationOptions = useMemo(() => ({
    getItemId: (standing: TeamStanding) => standing.teamId
  }), []);

  // Use custom hook for animations
  const animatedTeams = useStandingsAnimation(standings, animationOptions);

  return (
    <div className="overflow-hidden rounded-lg">
      {standings.length === 0 ? (
        <div className="text-center p-4 rounded text-gray-300">
          No constructor standings available yet. Try placing drivers in race positions.
        </div>
      ) : (
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="text-gray-300 border-gray-600">
              <th className="w-12 text-left py-2 font-normal text-sm">Pos</th>
              <th className="text-left py-2 font-normal text-sm">Constructor</th>
              <th className="text-right py-2 pr-2 font-normal text-sm">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => {
              const team = teamById[standing.teamId];
              if (!team) return null;
              
              return (
                <tr 
                  key={standing.teamId} 
                  className={`
                    hover:bg-gray-50
                    ${animatedTeams[standing.teamId] === 'up' ? 'animate-position-up' : ''}
                    ${animatedTeams[standing.teamId] === 'down' ? 'animate-position-down' : ''}
                  `}
                >
                  <td className="py-3 px-2 text-center font-bold text-gray-700 w-12">
                    {standing.position}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div 
                        className="h-5 w-4 mr-2 rounded-sm"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="font-medium text-gray-800">{team.name}</div>
                    </div>
                  </td>
                  <td 
                    className={`py-3 px-2 font-bold text-right text-gray-800 ${animatedTeams[standing.teamId] ? 'animate-points-update' : ''}`}
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

export default TeamStandingsTable;