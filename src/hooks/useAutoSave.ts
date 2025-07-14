import { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getBrowserFingerprint } from '../utils/fingerprint';
import { savePrediction } from '../api/predictions';
import { setFingerprint, setSaveStatus, setSaveInfo } from '../store/slices/predictionSlice';
import useAppDispatch from './useAppDispatch';

export const useAutoSave = () => {
  const dispatch = useAppDispatch();
  const { positions } = useSelector((state: RootState) => state.grid);
  const { selectedPointsSystem } = useSelector((state: RootState) => state.ui);
  const { fingerprint, isDirty } = useSelector((state: RootState) => state.predictions);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize fingerprint
  useEffect(() => {
    const init = async () => {
      try {
        // Get or create fingerprint
        const fp = await getBrowserFingerprint();
        dispatch(setFingerprint(fp));
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing fingerprint:', error);
      }
    };

    init();
  }, [dispatch]);

  // Save function
  const save = useCallback(async () => {
    if (!fingerprint || !isDirty) return;

    // Create a hash of current data to avoid duplicate saves
    const currentData = JSON.stringify({ positions, selectedPointsSystem });
    if (currentData === lastSavedDataRef.current) {
      return;
    }

    try {
      dispatch(setSaveStatus('saving'));
      const response = await savePrediction(fingerprint, positions, selectedPointsSystem);
      
      if (response.success) {
        dispatch(setSaveInfo({
          timestamp: response.timestamp,
          version: response.version
        }));
        lastSavedDataRef.current = currentData;
      }
    } catch (error) {
      console.error('Error saving prediction:', error);
      dispatch(setSaveStatus('error'));
    }
  }, [fingerprint, positions, selectedPointsSystem, isDirty, dispatch]);

  // Auto-save when data changes
  useEffect(() => {
    if (!fingerprint || !isDirty) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [fingerprint, isDirty, save]);

  return { save, isInitialized };
};