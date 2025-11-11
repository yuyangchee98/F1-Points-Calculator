import { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getBrowserFingerprint } from '../utils/fingerprint';
import { savePrediction } from '../api/predictions';
import { setFingerprint, setSaveInfo } from '../store/slices/predictionSlice';
import { useAppDispatch } from '../store';
import { toastService } from '../components/common/ToastContainer';

export const useAutoSave = () => {
  const dispatch = useAppDispatch();
  const { positions } = useSelector((state: RootState) => state.grid);
  const { selectedPointsSystem } = useSelector((state: RootState) => state.ui);
  const { fingerprint, isDirty } = useSelector((state: RootState) => state.predictions);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const fp = await getBrowserFingerprint();
        dispatch(setFingerprint(fp));
        setIsInitialized(true);
      } catch (error) {
      }
    };

    init();
  }, [dispatch]);

  const save = useCallback(async () => {
    if (!fingerprint || !isDirty) return;

    const currentData = JSON.stringify({ positions, selectedPointsSystem });
    if (currentData === lastSavedDataRef.current) {
      return;
    }

    try {
      toastService.addToast('Saving predictions...', 'info', 2000, '#6b7280');
      const response = await savePrediction(fingerprint, positions, selectedPointsSystem);

      if (response.success) {
        dispatch(setSaveInfo({
          timestamp: response.timestamp,
          version: response.version
        }));
        lastSavedDataRef.current = currentData;
        toastService.addToast('Predictions saved ✓', 'success', 2000, '#10b981');
      }
    } catch (error) {
      toastService.addToast('Failed to save predictions', 'warning', 3000, '#ef4444');
    }
  }, [fingerprint, positions, selectedPointsSystem, isDirty, dispatch]);

  useEffect(() => {
    if (!fingerprint || !isDirty) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [fingerprint, isDirty, save]);

  return { save, isInitialized };
};