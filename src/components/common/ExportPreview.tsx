import React from 'react';
import { ExportData } from '../../utils/exportFormatter';

interface ExportPreviewProps {
  data: ExportData;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({ data }) => {
  const { races, grids, standings, drivers, teams } = data;

  // Get team by ID
  const getTeamColor = (teamId: string) => teams[teamId]?.color || '#ccc';
  const getDriverName = (driverId: string) => drivers[driverId]?.name || driverId.toUpperCase();

  return (
    <div className="flex justify-center items-start">
      {/* Container scaled to fit preview */}
      <div
        className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl"
        style={{
          width: '400px',
          height: '400px',
          transform: 'scale(1)',
          transformOrigin: 'top center',
        }}
      >
        <div className="p-3 h-full flex flex-col text-[6px]">
          {/* Title Section */}
          <div className="mb-2">
            <h1 className="text-[11px] font-bold text-gray-800 leading-tight">
              {data.title}
            </h1>
            {data.subtitle && (
              <p className="text-[5px] text-gray-600 mt-0.5">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Race Grid Section */}
          <div className="flex-1 mb-2 overflow-hidden">
            <div className="flex gap-1 h-full">
              {/* Position/Points column */}
              <div className="flex flex-col w-6 flex-shrink-0">
                <div className="h-8 mb-1" />
                {[
                  { pos: 1, pts: 25 },
                  { pos: 2, pts: 18 },
                  { pos: 3, pts: 15 },
                  { pos: 4, pts: 12 },
                  { pos: 5, pts: 10 },
                ].map(({ pos, pts }) => (
                  <div key={pos} className="h-5 mb-1 flex flex-col items-center justify-center bg-gray-300 rounded-sm">
                    <div className="text-[7px] font-bold text-gray-700">{pos}</div>
                    <div className="text-[4px] text-gray-500">{pts}</div>
                  </div>
                ))}
              </div>

              {/* Race columns */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1">
                  {races.slice(0, 8).map(race => {
                    const raceGrid = grids[race.raceId] || [];
                    return (
                      <div key={race.raceId} className="flex flex-col w-12 flex-shrink-0">
                        {/* Race header */}
                        <div className="h-8 mb-1 p-1 bg-white rounded flex flex-col items-center justify-center">
                          <div className="text-[6px]">{race.flag}</div>
                          <div className="text-[4px] text-gray-600 text-center leading-tight truncate w-full">
                            {race.name.split(' ')[0]}
                          </div>
                        </div>
                        {/* Race positions */}
                        {[1, 2, 3, 4, 5].map(position => {
                          const gridPos = raceGrid.find(g => g.position === position);
                          const teamColor = gridPos ? getTeamColor(drivers[gridPos.driverId]?.teamId) : '#e5e7eb';
                          return (
                            <div
                              key={position}
                              className="h-5 mb-1 rounded-sm flex items-center justify-center"
                              style={{ backgroundColor: teamColor }}
                            >
                              {gridPos && (
                                <span className="text-[5px] font-semibold text-white truncate px-0.5">
                                  {getDriverName(gridPos.driverId).substring(0, 3)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {races.length > 8 && (
                    <div className="flex items-center justify-center w-12 text-[5px] text-gray-400">
                      +{races.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Championship Standings */}
          <div className="bg-white rounded shadow-sm p-2">
            <h2 className="text-[7px] font-bold text-gray-800 mb-1">CHAMPIONSHIP STANDINGS</h2>
            <div className="space-y-0.5">
              {standings.slice(0, 10).map(standing => {
                const teamColor = getTeamColor(drivers[standing.driverId]?.teamId);
                return (
                  <div key={standing.driverId} className="flex items-center gap-1 text-[5px]">
                    <div className="w-4 text-center font-bold text-gray-700 flex items-center justify-center gap-0.5">
                      <span>{standing.position}</span>
                      {standing.positionChange !== 0 && (
                        <span className={standing.positionChange > 0 ? 'text-green-600' : 'text-red-600'}>
                          {standing.positionChange > 0 ? '↑' : '↓'}{Math.abs(standing.positionChange)}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-1 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <div className="flex-1 font-medium text-gray-800 truncate">
                      {getDriverName(standing.driverId)}
                    </div>
                    <div className="font-bold text-gray-700 flex items-center gap-0.5">
                      <span>{standing.points}</span>
                      {standing.pointsGained > 0 && (
                        <span className="text-green-600 bg-green-100 px-0.5 rounded text-[4px]">
                          +{standing.pointsGained}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {standings.length > 10 && (
                <div className="text-center text-[4px] text-gray-400 pt-0.5">
                  +{standings.length - 10} more drivers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;
