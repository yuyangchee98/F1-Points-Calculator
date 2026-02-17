import React from 'react';
import { Race } from '../../types';
import RaceColumn from '../grid/RaceColumn';
import { getGridPositions, CURRENT_SEASON } from '../../utils/constants';

interface SingleRaceGridProps {
  race: Race;
}

const ROW_HEIGHT = 56;

const SingleRaceGrid: React.FC<SingleRaceGridProps> = ({ race }) => {
  const posCount = getGridPositions(CURRENT_SEASON);

  return (
    <div className="space-y-1.5">
      {Array.from({ length: posCount }, (_, i) => i + 1).map(position => (
        <div key={position} className="flex items-center gap-2">
          <div
            className={`w-10 flex-shrink-0 text-center text-sm font-bold rounded-md py-1 ${
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
      ))}
    </div>
  );
};

export default SingleRaceGrid;
