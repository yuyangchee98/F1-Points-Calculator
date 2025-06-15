import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { POINTS_MAP } from '../../data/points';
import PositionColumn from './PositionColumn';
import RaceColumn from './RaceColumn';
import useWindowSize from '../../hooks/useWindowSize';

const RaceGrid: React.FC = () => {
  const races = useSelector((state: RootState) => state.races.list);
  const selectedRace = useSelector((state: RootState) => state.ui.selectedRace);
  const { isMobile, isTablet } = useWindowSize();
  
  // Determine column width based on screen size
  const getMinColumnWidth = () => {
    if (isMobile) return '100px';
    if (isTablet) return '110px';
    return '120px';
  };
  
  return (
    <div className="overflow-x-auto pb-4 shadow-md rounded-lg border border-gray-200">
      <div 
        id="race-grid"
        className="race-grid" 
        style={{ 
          gridTemplateColumns: `80px repeat(${races.length}, minmax(${getMinColumnWidth()}, 1fr))`,
          gridAutoRows: 'minmax(40px, auto)'
        }}
      >
        {/* Position header */}
        <div className="position-header sticky left-0 z-10">Position</div>
        
        {/* Race headers */}
        {races.map(race => (
          <div 
            key={race.id} 
            className={`race-header ${race.isSprint ? 'sprint' : ''} ${race.completed ? 'completed-race-header' : ''}`}
          >
            {race.countryCode && (
              <img 
                src={`/flags/${race.countryCode}.png`} 
                alt={race.country} 
                className="flag"
              />
            )}
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{race.name}</span>
            {race.completed && (
              <span className="completed-indicator" title="Completed Race">✓</span>
            )}
          </div>
        ))}
        
        
        {/* Grid rows - 20 positions */}
        {Array.from({ length: 20 }, (_, i) => i + 1).map(position => (
          <React.Fragment key={position}>
            {/* Apply even-row class to alternating rows */}
            <div 
              className={`contents animate-grid-entry grid-row-${Math.min(position, 10)} ${position % 2 === 0 ? 'even-row' : ''}`}
            >
              {/* Position column */}
              <PositionColumn position={position} />
              
              {/* Race slots for this position */}
              {races.map(race => (
                <RaceColumn 
                  key={`${race.id}-${position}`}
                  race={race}
                  position={position}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RaceGrid;