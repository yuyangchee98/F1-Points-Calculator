// src/tests/components/dragDropIntegration.test.tsx
// React import is automatically included with JSX
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DriverSelection from '../../components/drivers/DriverSelection';
// RaceGrid component import not used in these tests
import { Driver } from '../../types';

// Mock Sortable
jest.mock('sortablejs', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn()
  }));
});

const mockStore = configureStore([]);

// Mock drivers for testing
const mockDrivers: Driver[] = [
  { id: 'ver', name: 'Max Verstappen', team: 'red-bull', number: 1 },
  { id: 'ham', name: 'Lewis Hamilton', team: 'mercedes', number: 44 },
  { id: 'lec', name: 'Charles Leclerc', team: 'ferrari', number: 16 },
];

// Mock races for testing
const mockRaces = [
  { id: 'race1', name: 'Bahrain', countryCode: 'bh', isSprint: false, country: 'Bahrain', order: 1, completed: false },
  { id: 'race2', name: 'Saudi Arabia', countryCode: 'sa', isSprint: false, country: 'Saudi Arabia', order: 2, completed: false },
];

describe('Drag and Drop Integration', () => {
  let store: any;
  
  beforeEach(() => {
    // Create a more complete mock store with the data we need
    store = mockStore({
      drivers: {
        list: mockDrivers,
      },
      races: {
        list: mockRaces,
      },
      grid: {
        positions: [
          { raceId: 'race1', position: 1, driverId: null, isOfficialResult: false },
          { raceId: 'race1', position: 2, driverId: null, isOfficialResult: false },
          { raceId: 'race2', position: 1, driverId: null, isOfficialResult: false },
          { raceId: 'race2', position: 2, driverId: null, isOfficialResult: false },
        ],
        fastestLaps: {},
      },
      ui: {
        selectedDriver: null,
        showOfficialResults: false,
      },
    });
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  test('should initialize Sortable on the driver selection component', () => {
    // We need to mock document.querySelectorAll for the race slots
    document.querySelectorAll = jest.fn().mockReturnValue([]);
    
    render(
      <Provider store={store}>
        <DriverSelection />
      </Provider>
    );
    
    // Check if Sortable constructor was called
    const SortableMock = require('sortablejs');
    expect(SortableMock).toHaveBeenCalled();
    
    // Get the options passed to the Sortable constructor
    const options = SortableMock.mock.calls[0][1];
    expect(options.group.name).toBe('drivers');
    expect(options.group.pull).toBe('clone');
    expect(options.draggable).toBe('.driver-card');
  });
  
  test('should render proper structure for drag and drop interaction', () => {
    // Mock the DOM queries needed for SortableJS
    document.querySelectorAll = jest.fn().mockReturnValue([]);
    
    // Only render the driver selection component to avoid SortableJS initialization in RaceGrid
    render(
      <Provider store={store}>
        <DriverSelection />
      </Provider>
    );
    
    // Check that driver cards are rendered with proper attributes
    mockDrivers.forEach(driver => {
      const driverElement = screen.getByText(driver.name).closest('.driver-card');
      expect(driverElement).toHaveAttribute('data-driver-id', driver.id);
    });
  });
});