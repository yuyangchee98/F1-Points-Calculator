import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { TeamStanding } from '../../types';
import { selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { useStandingsAnimation } from '../../hooks/useStandingsAnimation';

interface TeamStandingsTableProps {
  standings: TeamStanding[];
}

const TeamStandingsTable: React.FC<TeamStandingsTableProps> = ({ standings }) => {
  const teamById = useSelector(selectTeamsByIdMap);

  const animationOptions = useMemo(() => ({
    getItemId: (standing: TeamStanding) => standing.teamId
  }), []);

  const animatedTeams = useStandingsAnimation(standings, animationOptions);

  return (
    <div>
      {standings.length === 0 ? (
        <div className="text-center p-4 text-ink-muted text-sm">
          No constructor standings available yet. Try placing drivers in race positions.
        </div>
      ) : (
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="text-ink-muted">
              <th className="w-10 text-left py-1 px-2 font-medium text-2xs uppercase tracking-wider">Pos</th>
              <th className="text-left py-1 font-medium text-2xs uppercase tracking-wider">Constructor</th>
              <th className="text-right py-1 pr-2 font-medium text-2xs uppercase tracking-wider">Points</th>
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
                    hover:bg-carbon-50
                    ${animatedTeams[standing.teamId] === 'up' ? 'animate-position-up' : ''}
                    ${animatedTeams[standing.teamId] === 'down' ? 'animate-position-down' : ''}
                  `}
                >
                  <td className="py-1.5 px-2 text-center font-bold text-ink-secondary text-sm w-10 tnum font-display">
                    {standing.position}
                  </td>
                  <td className="py-1.5">
                    <div className="flex items-center">
                      <div
                        className="h-3.5 w-1 mr-2 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="font-medium text-sm text-ink">{team.name}</div>
                    </div>
                  </td>
                  <td
                    className={`py-1.5 px-2 font-bold text-sm text-right text-ink tnum font-display ${animatedTeams[standing.teamId] ? 'animate-points-update' : ''}`}
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

export default TeamStandingsTable;