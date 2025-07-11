import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectDriver } from '../../store/slices/uiSlice';
import DriverCard from './DriverCard';
import useAppDispatch from '../../hooks/useAppDispatch';
import useWindowSize from '../../hooks/useWindowSize';
import { getDriversForRace } from '../../utils/driverHelper';
import { GA_EVENTS, trackEvent } from '../../utils/analytics';

interface DriverSelectionProps {
  forceExpanded?: boolean;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({ forceExpanded = false }) => {
  const dispatch = useAppDispatch();
  const allDrivers = useSelector((state: RootState) => state.drivers.list);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const selectedRaceId = useSelector((state: RootState) => state.ui.selectedRace);
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const { isMobile } = useWindowSize();
  
  // Filter drivers based on the currently selected race
  // This ensures we only show the correct version of Tsunoda and Lawson for each race
  const drivers = useMemo(() => {
    if (!selectedRaceId) {
      // If no race is selected, show all drivers
      return allDrivers;
    }
    return getDriversForRace(selectedRaceId, allDrivers);
  }, [selectedRaceId, allDrivers]);
  
  // Update expanded state when forceExpanded prop changes
  useEffect(() => {
    setIsExpanded(forceExpanded);
  }, [forceExpanded]);

  const handleDriverClick = (driverId: string) => {
    // If already selected, deselect
    if (selectedDriverId === driverId) {
      dispatch(selectDriver(null));
    } else {
      dispatch(selectDriver(driverId));
      trackEvent(GA_EVENTS.DRIVER_ACTIONS.SELECT_DRIVER, 'Driver Selection', driverId);
    }
    
    // On mobile, collapse the selection panel after choosing
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">DRIVERS</h2>
        <button
          id="driver-toggle-button"
          className="sm:hidden bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md shadow-lg transition-all duration-200 flex items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              HIDE DRIVERS
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              SELECT DRIVER
            </>
          )}
        </button>
      </div>
      
      <div 
        id="driver-selection"
        className={`
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 
          ${isExpanded ? 'max-h-[800px]' : 'max-h-0 sm:max-h-[800px]'} 
          overflow-hidden transition-all duration-300 ease-in-out
          ${forceExpanded ? 'overflow-y-auto pb-20' : 'sm:overflow-visible sm:max-h-full'} 
          p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200
        `}
      >
        {drivers.map(driver => (
          <DriverCard
            key={driver.id}
            driver={driver}
            isSelected={selectedDriverId === driver.id}
            onClick={() => handleDriverClick(driver.id)}
          />
        ))}
      </div>
      
      {/* Mobile selection indicator */}
      {selectedDriverId && (
        <div 
          id="mobile-selection-indicator"
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 
                    bg-red-600 text-white px-5 py-3 rounded-lg shadow-xl 
                    flex items-center space-x-3 z-50 sm:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
          </svg>
          <span className="selected-driver-name font-medium">
            {drivers.find(d => d.id === selectedDriverId)?.name || ''}
          </span>
          <span className="text-sm ml-2 text-gray-100">Tap blue grid slots to place</span>
          <button 
            className="cancel-selection ml-2 bg-white bg-opacity-20 rounded-full w-7 h-7 
                    flex items-center justify-center transition-all hover:bg-opacity-30"
            onClick={() => dispatch(selectDriver(null))}
            aria-label="Cancel selection"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverSelection;