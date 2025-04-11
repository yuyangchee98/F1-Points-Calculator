// src/tests/store/gridSlice.test.ts
import gridReducer, { 
  placeDriver, 
  clearPosition, 
  swapPositions
} from '../../store/slices/gridSlice';
import { GridState } from '../../types';

describe('Grid Slice', () => {
  const initialState: GridState = {
    positions: [
      { raceId: 'race1', position: 1, driverId: null, isOfficialResult: false },
      { raceId: 'race1', position: 2, driverId: null, isOfficialResult: false },
      { raceId: 'race1', position: 3, driverId: 'ham', isOfficialResult: true },
      { raceId: 'race2', position: 1, driverId: 'ver', isOfficialResult: false },
      { raceId: 'race2', position: 2, driverId: null, isOfficialResult: false },
    ],
    fastestLaps: {}
  };

  describe('placeDriver action', () => {
    test('should place a driver in an empty position', () => {
      const action = placeDriver({ raceId: 'race1', position: 1, driverId: 'ver' });
      const state = gridReducer(initialState, action);
      
      const position = state.positions.find(p => p.raceId === 'race1' && p.position === 1);
      expect(position?.driverId).toBe('ver');
      expect(position?.isOfficialResult).toBe(false);
    });

    test('should handle placing a driver in a position that already has a driver', () => {
      const action = placeDriver({ raceId: 'race2', position: 1, driverId: 'lec' });
      const state = gridReducer(initialState, action);
      
      const position = state.positions.find(p => p.raceId === 'race2' && p.position === 1);
      expect(position?.driverId).toBe('lec');
    });

    test('should handle placing a driver that is already in another position of the same race', () => {
      // First, set up a state where ver is in position 1
      let state = gridReducer(
        initialState, 
        placeDriver({ raceId: 'race1', position: 1, driverId: 'ver' })
      );
      
      // Now move ver to position 2
      state = gridReducer(
        state,
        placeDriver({ raceId: 'race1', position: 2, driverId: 'ver' })
      );
      
      // Position 1 should now be empty
      const position1 = state.positions.find(p => p.raceId === 'race1' && p.position === 1);
      expect(position1?.driverId).toBeNull();
      
      // Position 2 should now have ver
      const position2 = state.positions.find(p => p.raceId === 'race1' && p.position === 2);
      expect(position2?.driverId).toBe('ver');
    });

    test('should override official results but set isOfficialResult to false', () => {
      const action = placeDriver({ raceId: 'race1', position: 3, driverId: 'ver' });
      const state = gridReducer(initialState, action);
      
      const position = state.positions.find(p => p.raceId === 'race1' && p.position === 3);
      expect(position?.driverId).toBe('ver');
      expect(position?.isOfficialResult).toBe(false);
    });
  });

  describe('clearPosition action', () => {
    test('should clear a driver from a position', () => {
      const action = clearPosition({ raceId: 'race2', position: 1 });
      const state = gridReducer(initialState, action);
      
      const position = state.positions.find(p => p.raceId === 'race2' && p.position === 1);
      expect(position?.driverId).toBeNull();
    });

    test('should set isOfficialResult to false when clearing an official result', () => {
      const action = clearPosition({ raceId: 'race1', position: 3 });
      const state = gridReducer(initialState, action);
      
      const position = state.positions.find(p => p.raceId === 'race1' && p.position === 3);
      expect(position?.driverId).toBeNull();
      expect(position?.isOfficialResult).toBe(false);
    });
  });

  describe('swapPositions action', () => {
    test('should swap drivers between two positions', () => {
      // First set up a state with two drivers
      let state = gridReducer(
        initialState,
        placeDriver({ raceId: 'race1', position: 1, driverId: 'ver' })
      );
      
      state = gridReducer(
        state,
        placeDriver({ raceId: 'race1', position: 2, driverId: 'lec' })
      );
      
      // Now swap them
      state = gridReducer(
        state,
        swapPositions({ raceId: 'race1', position1: 1, position2: 2 })
      );
      
      // Check the swap worked
      const position1 = state.positions.find(p => p.raceId === 'race1' && p.position === 1);
      const position2 = state.positions.find(p => p.raceId === 'race1' && p.position === 2);
      
      expect(position1?.driverId).toBe('lec');
      expect(position2?.driverId).toBe('ver');
      expect(position1?.isOfficialResult).toBe(false);
      expect(position2?.isOfficialResult).toBe(false);
    });

    test('should handle swapping with an empty position', () => {
      // Set up a state with one driver
      const state1 = gridReducer(
        initialState,
        placeDriver({ raceId: 'race1', position: 1, driverId: 'ver' })
      );
      
      // Swap with an empty position
      const state2 = gridReducer(
        state1,
        swapPositions({ raceId: 'race1', position1: 1, position2: 2 })
      );
      
      // Check the swap worked
      const position1 = state2.positions.find(p => p.raceId === 'race1' && p.position === 1);
      const position2 = state2.positions.find(p => p.raceId === 'race1' && p.position === 2);
      
      expect(position1?.driverId).toBeNull();
      expect(position2?.driverId).toBe('ver');
    });
  });
});
