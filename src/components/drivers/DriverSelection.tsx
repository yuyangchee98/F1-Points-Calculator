import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { selectDriver } from '../../store/slices/uiSlice';
import DriverCard from './DriverCard';
import { useAppDispatch } from '../../store';
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
        <h2 className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">Drivers</h2>
        <button
          id="driver-toggle-button"
          className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 transition-colors"
          onClick={() => {
            setIsExpanded(!isExpanded);
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
          p-2 bg-surface-sunken rounded-lg border
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
                    bg-carbon-900 text-white px-5 py-3 rounded-lg shadow-lg
                    flex items-center space-x-3 z-modal sm:hidden"
        >
          <span className="w-2 h-2 rounded-full bg-brand shrink-0" aria-hidden="true" />
          <span className="selected-driver-name font-medium">
            {selectedDriverId ? getDriverLastName(selectedDriverId) : ''}
          </span>
          <span className="text-sm ml-2 text-carbon-300">Tap highlighted slots to place</span>
          <button 
            className="cancel-selection ml-2 bg-white bg-opacity-20 rounded-full w-7 h-7 
                    flex items-center justify-center transition-all hover:bg-opacity-30"
            onClick={() => {
              dispatch(selectDriver(null));
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