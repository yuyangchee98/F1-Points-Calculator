import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { loadPrediction } from '../api/predictions';
import useAppDispatch from './useAppDispatch';

export const useLoadPredictions = () => {
  const dispatch = useAppDispatch();
  const { fingerprint } = useSelector((state: RootState) => state.predictions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fingerprint || hasLoaded) return;

    const loadSavedPredictions = async () => {
      setIsLoading(true);
      
      try {
        const saved = await loadPrediction(fingerprint);
        
        if (saved && saved.grid && saved.grid.length > 0) {
          // Group positions by race and position for easier lookup
          const savedPositionsMap = new Map<string, string>();
          saved.grid.forEach(pos => {
            if (pos.driverId && !pos.isOfficialResult) {
              const key = `${pos.raceId}-${pos.position}`;
              savedPositionsMap.set(key, pos.driverId);
            }
          });

          // Load saved positions into the grid
          // We need to dispatch actions to update the grid
          // Import the necessary action creators dynamically to avoid circular deps
          const { moveDriver } = await import('../store/slices/gridSlice');
          
          // Apply saved positions
          savedPositionsMap.forEach((driverId, key) => {
            const [raceId, position] = key.split('-');
            dispatch(moveDriver({
              driverId,
              toRaceId: raceId,
              toPosition: parseInt(position, 10)
            }));
          });

          // If a different points system was saved, update it
          if (saved.pointsSystem) {
            const { selectPointsSystem } = await import('../store/slices/uiSlice');
            dispatch(selectPointsSystem(saved.pointsSystem));
          }
        }
        
        setHasLoaded(true);
      } catch (error) {
        setError('Failed to load predictions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPredictions();
  }, [fingerprint, hasLoaded, dispatch]);

  return { isLoading };
};