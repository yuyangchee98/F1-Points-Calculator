import React from 'react';
import { Race } from '../../types';
import RaceColumn from '../grid/RaceColumn';
import { getGridPositions, CURRENT_SEASON } from '../../utils/constants';

interface SingleRaceGridProps {
  race: Race;
}

const ROW_HEIGHT = 56;

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const SingleRaceGrid: React.FC<SingleRaceGridProps> = ({ race }) => {
  const posCount = getGridPositions(CURRENT_SEASON);
  const colSize = Math.ceil(posCount / 3);
  const col1 = Array.from({ length: colSize }, (_, i) => i + 1);
  const col2 = Array.from({ length: colSize }, (_, i) => colSize + i + 1).filter(p => p <= posCount);
  const col3 = Array.from({ length: colSize }, (_, i) => colSize * 2 + i + 1).filter(p => p <= posCount);

  const renderPosition = (position: number) => (
    <div key={position} className="flex items-center gap-1.5">
      <div
        className={`w-8 flex-shrink-0 text-center text-xs font-bold rounded py-0.5 ${
          position <= 3
            ? 'bg-gray-800 text-white'
            : position <= 10
            ? 'bg-gray-200 text-gray-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        P{position}
      </div>
      <div className="flex-1" style={{ height: ROW_HEIGHT }}>
        <RaceColumn
          race={race}
          position={position}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );

  return (
    <div>
      {/* Race header */}
      <div className="race-header mb-3" style={{ height: 56 }}>
        {race.countryCode && (
          <img
            src={`/flags/${race.countryCode}.webp`}
            alt={race.country}
            className="flag"
          />
        )}
        <span className="text-sm">{formatName(race.name)}</span>
      </div>

      {/* Triple-column positions */}
      <div className="grid grid-cols-3 gap-x-3">
        <div className="space-y-1.5">
          {col1.map(renderPosition)}
        </div>
        <div className="space-y-1.5">
          {col2.map(renderPosition)}
        </div>
        <div className="space-y-1.5">
          {col3.map(renderPosition)}
        </div>
      </div>
    </div>
  );
};

export default SingleRaceGrid;
