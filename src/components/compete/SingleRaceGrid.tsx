import React from 'react';
import type { Race } from '../../types';
import RaceColumn from '../grid/RaceColumn';
import { getGridPositions, CURRENT_SEASON } from '../../utils/constants';

interface SingleRaceGridProps {
  race: Race;
  columns?: 2 | 3;
  weekendRaces?: Race[];
  onRaceSwitch?: (index: number) => void;
}

const ROW_HEIGHT = 56;

const formatName = (name: string) =>
  name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const SingleRaceGrid: React.FC<SingleRaceGridProps> = ({ race, columns = 3, weekendRaces, onRaceSwitch }) => {
  const posCount = getGridPositions(CURRENT_SEASON);
  const colSize = Math.ceil(posCount / columns);
  const cols = Array.from({ length: columns }, (_, c) =>
    Array.from({ length: colSize }, (_, i) => colSize * c + i + 1).filter(p => p <= posCount)
  );

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
      <div className="flex-1 min-w-0 overflow-hidden" style={{ height: ROW_HEIGHT }}>
        <RaceColumn
          race={race}
          position={position}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );

  const hasSelector = weekendRaces && weekendRaces.length > 1 && onRaceSwitch;

  return (
    <div>
      {/* Race header — becomes a selector on sprint weekends */}
      {hasSelector ? (
        <div className="race-header mb-3 flex flex-row gap-2" style={{ height: 56 }}>
          {race.countryCode && (
            <img
              src={`/flags/${race.countryCode}.webp`}
              alt={race.country}
              className="flag"
            />
          )}
          <select
            value={race.id}
            onChange={(e) => {
              const idx = weekendRaces.findIndex(r => r.id === e.target.value);
              if (idx >= 0) onRaceSwitch(idx);
            }}
            className="bg-transparent text-white text-sm font-bold border-none outline-none cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', paddingRight: '16px' }}
          >
            {weekendRaces.map(r => (
              <option key={r.id} value={r.id} className="text-gray-900">
                {formatName(r.name)}
              </option>
            ))}
          </select>
        </div>
      ) : (
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
      )}

      {/* Position columns */}
      <div className={`grid gap-x-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {cols.map((positions, c) => (
          <div key={c} className="space-y-1.5">
            {positions.map(renderPosition)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleRaceGrid;
