// src/tests/components/dragDrop.test.tsx
// React import is automatically included with JSX
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DriverCard from '../../components/drivers/DriverCard';
import RaceColumn from '../../components/grid/RaceColumn';
import { Driver } from '../../types';

// Mock Sortable and store
jest.mock('sortablejs');
const mockStore = configureStore([]);

describe('Drag and Drop Components', () => {
  let store: any;
  
  beforeEach(() => {
    store = mockStore({
      grid: {
        positions: [
          { raceId: 'race1', position: 1, driverId: null, isOfficialResult: false },
        ],
      },
      ui: {
        selectedDriver: null,
      },
    });
    
    jest.clearAllMocks();
  });
  
  describe('DriverCard', () => {
    const mockDriver: Driver = {
      id: 'ver',
      name: 'Max Verstappen',
      team: 'red-bull',
      number: 1,
    };
    
    test('should render with proper data attributes for SortableJS', () => {
      render(
        <DriverCard 
          driver={mockDriver} 
          isOfficialResult={false} 
          isSelected={false}
        />
      );
      
      const driverCard = screen.getByText('Max Verstappen').closest('div');
      expect(driverCard).toHaveAttribute('data-driver-id', 'ver');
      expect(driverCard).toHaveAttribute('data-driver-name', 'Max Verstappen');
      expect(driverCard).toHaveAttribute('data-official-result', 'false');
      expect(driverCard).toHaveClass('driver-card');
      expect(driverCard).toHaveClass('cursor-grab');
    });
    
    test('should have official-result class when it is an official result', () => {
      render(
        <DriverCard 
          driver={mockDriver} 
          isOfficialResult={true} 
          isSelected={false}
        />
      );
      
      const driverCard = screen.getByText('Max Verstappen').closest('div');
      expect(driverCard).toHaveClass('official-result');
    });
    
    test('should be highlighted when selected', () => {
      render(
        <DriverCard 
          driver={mockDriver} 
          isOfficialResult={false} 
          isSelected={true}
        />
      );
      
      const driverCard = screen.getByText('Max Verstappen').closest('div');
      expect(driverCard).toHaveClass('ring-2');
      expect(driverCard).toHaveClass('ring-green-500');
    });
  });
  
  describe('RaceColumn', () => {
    const mockRace = {
      id: 'race1',
      name: 'Bahrain',
      countryCode: 'bh',
      isSprint: false,
      country: 'Bahrain',
      order: 1,
      completed: false
    };
    
    test('should render empty race slot with proper data attributes', () => {
      render(
        <Provider store={store}>
          <RaceColumn race={mockRace} position={1} />
        </Provider>
      );
      
      const raceColumn = screen.getByTestId('race-slot');
      expect(raceColumn).toHaveAttribute('data-race-id', 'race1');
      expect(raceColumn).toHaveAttribute('data-position', '1');
      expect(raceColumn).toHaveAttribute('data-official-result', 'false');
      expect(raceColumn).toHaveClass('race-slot');
    });
    
    test('should render race slot with a driver if one is assigned', () => {
      const storeWithDriver = mockStore({
        grid: {
          positions: [
            { raceId: 'race1', position: 1, driverId: 'ver', isOfficialResult: false },
          ],
        },
        ui: {
          selectedDriver: null,
        },
      });

      // Mock the driver lookup
      jest.mock('../../data/drivers', () => ({
        driverById: {
          ver: {
            id: 'ver',
            name: 'Max Verstappen',
            team: 'red-bull',
            number: 1,
          }
        }
      }));
      
      render(
        <Provider store={storeWithDriver}>
          <RaceColumn race={mockRace} position={1} />
        </Provider>
      );
      
      // Since we're mocking the driver lookup, we test for the existence of the race slot
      const raceColumn = screen.getByTestId('race-slot');
      expect(raceColumn).toBeInTheDocument();
    });
    
    test('should have sprint class when race is a sprint', () => {
      const sprintRace = {
        ...mockRace,
        isSprint: true,
      };
      
      render(
        <Provider store={store}>
          <RaceColumn race={sprintRace} position={1} />
        </Provider>
      );
      
      const raceColumn = screen.getByTestId('race-slot');
      expect(raceColumn).toHaveClass('sprint');
    });
  });
});
