import React, { useState, useEffect } from 'react';
import { TeamStanding } from '../../types';
import { teamById } from '../../data/teams';

interface TeamStandingsTableProps {
  standings: TeamStanding[];
}

const TeamStandingsTable: React.FC<TeamStandingsTableProps> = ({ standings }) => {
  // Track previous standings for animation
  const [prevStandings, setPrevStandings] = useState<TeamStanding[]>([]);
  const [animatedTeams, setAnimatedTeams] = useState<Record<string, 'up' | 'down' | 'none'>>({});
  
  // Detect position changes and set animations
  useEffect(() => {
    if (standings.length > 0 && prevStandings.length > 0) {
      const animations: Record<string, 'up' | 'down' | 'none'> = {};
      
      standings.forEach(standing => {
        const prevStanding = prevStandings.find(ps => ps.teamId === standing.teamId);
        
        if (prevStanding) {
          if (prevStanding.position > standing.position) {
            // Team moved up
            animations[standing.teamId] = 'up';
          } else if (prevStanding.position < standing.position) {
            // Team moved down
            animations[standing.teamId] = 'down';
          } else {
            // Position unchanged
            animations[standing.teamId] = 'none';
          }
        } else {
          // New team in standings
          animations[standing.teamId] = 'none';
        }
      });
      
      setAnimatedTeams(animations);
      
      // Clear animations after they play
      const timer = setTimeout(() => {
        setAnimatedTeams({});
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous standings for next comparison
    setPrevStandings(standings);
  }, [standings]);

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