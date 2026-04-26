import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { selectDriver } from '../../store/slices/uiSlice';
import DriverCard from './DriverCard';
import { useAppDispatch } from '../../store';
import { GA_EVENTS, trackEvent } from '../../utils/analytics';
import { getDriverLastName } from '../../store/selectors/dataSelectors';

const DriverSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const allDrivers = useSelector((state: RootState) => state.seasonData.drivers);
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  // Start collapsed on smaller screens to preserve grid space
  const [isExpanded, setIsExpanded] = useState(() => window.innerWidth >= 1024);

  const drivers = allDrivers;

  const handleDriverClick = (driverId: string) => {
    if (selectedDriverId === driverId) {
      dispatch(selectDriver(null));
    } else {
      dispatch(selectDriver(driverId));
    }

    setIsExpanded(false);
  };

  return (
    <div className="mb-1.5">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Drivers</h2>
        <button
          id="driver-toggle-button"
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          onClick={() => {
            setIsExpanded(!isExpanded);
            trackEvent(
              GA_EVENTS.DRIVER_ACTIONS.TOGGLE_DRIVER_VISIBILITY,
              'Driver Selection',
              isExpanded ? 'hide' : 'show'
            );
          }}
        >
          {isExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Show
            </>
          )}
        </button>
      </div>
      
      <div 
        id="driver-selection"
        className={`
          grid gap-1.5
          ${isExpanded ? 'max-h-[25vh] lg:max-h-[35vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}
          overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
          p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200
        `}
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}
      >
        {drivers.map(driver => (
          <DriverCard
            key={driver.id}
            driver={driver}
            isSelected={selectedDriverId === driver.id}
            onClick={() => handleDriverClick(driver.id)}
            hideCode
          />
        ))}
      </div>

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
            {selectedDriverId ? getDriverLastName(selectedDriverId) : ''}
          </span>
          <span className="text-sm ml-2 text-gray-100">Tap blue grid slots to place</span>
          <button 
            className="cancel-selection ml-2 bg-white bg-opacity-20 rounded-full w-7 h-7 
                    flex items-center justify-center transition-all hover:bg-opacity-30"
            onClick={() => {
              dispatch(selectDriver(null));
              trackEvent(
                GA_EVENTS.DRIVER_ACTIONS.CANCEL_SELECTION,
                'Driver Selection',
                selectedDriverId || 'unknown'
              );
            }}
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