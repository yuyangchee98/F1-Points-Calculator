import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import PositionColumn from './PositionColumn';
import RaceColumn from './RaceColumn';
import useWindowSize from '../../hooks/useWindowSize';
import { togglePositionColumnMode } from '../../store/slices/uiSlice';
import useAppDispatch from '../../hooks/useAppDispatch';

interface RaceGridProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const RaceGrid: React.FC<RaceGridProps> = ({ scrollRef }) => {
  const dispatch = useAppDispatch();
  const races = useSelector((state: RootState) => state.races.list);
  const positionColumnMode = useSelector((state: RootState) => state.ui.positionColumnMode);
  const driverStandings = useSelector((state: RootState) => state.results.driverStandings);
  const { isMobile, isTablet } = useWindowSize();
  
  // Determine column width based on screen size
  const getMinColumnWidth = () => {
    if (isMobile) return '100px';
    if (isTablet) return '110px';
    return '120px';
  };
  
  // Auto-scroll to first non-completed race on mount
  useEffect(() => {
    if (!scrollRef?.current || races.length === 0) return;
    
    // Find the first non-completed race index
    const firstUpcomingRaceIndex = races.findIndex(race => !race.completed);
    
    // If all races are completed or no upcoming races, don't scroll
    if (firstUpcomingRaceIndex === -1) return;
    
    // Small delay to ensure the grid is fully rendered
    setTimeout(() => {
      if (!scrollRef.current) return;
      
      // Calculate the base column width based on screen size
      const columnWidth = isMobile ? 100 : isTablet ? 110 : 120;
      
      // Account for the position column (80px) and some padding
      const positionColumnWidth = 80;
      
      // Calculate scroll position
      // We want to show the upcoming race with some context (previous race visible)
      const scrollPosition = positionColumnWidth + (Math.max(0, firstUpcomingRaceIndex - 1) * columnWidth);
      
      // Perform the scroll
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }, 100);
  }, [races, scrollRef, isMobile, isTablet]);
  
  return (
    <div className="shadow-md rounded-lg border border-gray-200">
      <div 
        ref={scrollRef}
        id="race-grid"
        className="race-grid overflow-x-auto pb-4" 
        style={{ 
          gridTemplateColumns: `80px repeat(${races.length}, minmax(${getMinColumnWidth()}, 1fr))`,
          gridAutoRows: 'minmax(40px, auto)'
        }}
      >
        {/* Position header with toggle */}
        <div 
          className="position-header sticky left-0 z-10 cursor-pointer hover:bg-gray-800 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 group"
          onClick={() => dispatch(togglePositionColumnMode())}
          title={`Click to switch to ${positionColumnMode === 'position' ? 'championship standings' : 'grid positions'} view`}
        >
          <span className="text-[11px] font-bold">
            {positionColumnMode === 'position' ? 'Grid' : 'Driver'}
          </span>
          <span className="text-[9px] opacity-80">
            {positionColumnMode === 'position' ? 'Position' : 'Standings'}
          </span>
          <svg 
            className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
        
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
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
              {race.name
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
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
              <PositionColumn 
                position={position} 
                mode={positionColumnMode}
                standings={driverStandings}
              />
              
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