import { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getBrowserFingerprint } from '../utils/fingerprint';
import { savePrediction, UserIdentifier } from '../api/predictions';
import { setFingerprint, setSaveInfo } from '../store/slices/predictionSlice';
import { useAppDispatch } from '../store';
import { toastService } from '../components/common/ToastContainer';
import { getActiveSeason } from '../utils/constants';

export const useAutoSave = () => {
  const dispatch = useAppDispatch();
  const { positions } = useSelector((state: RootState) => state.grid);
  const { selectedPointsSystem } = useSelector((state: RootState) => state.ui);
  const { fingerprint, isDirty } = useSelector((state: RootState) => state.predictions);
  const { user } = useSelector((state: RootState) => state.auth);
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

  // Get identifier - prefer userId if logged in, fallback to fingerprint
  const getIdentifier = useCallback((): UserIdentifier | null => {
    if (user?.id) {
      return { userId: user.id };
    }
    if (fingerprint) {
      return { fingerprint };
    }
    return null;
  }, [user, fingerprint]);

  const save = useCallback(async () => {
    const identifier = getIdentifier();
    if (!identifier || !isDirty) return;

    const activeSeason = getActiveSeason();
    const currentData = JSON.stringify({ positions, selectedPointsSystem, season: activeSeason });
    if (currentData === lastSavedDataRef.current) {
      return;
    }

    try {
      const response = await savePrediction(identifier, positions, selectedPointsSystem, activeSeason);

      if (response.success) {
        dispatch(setSaveInfo({
          timestamp: response.timestamp,
          version: response.version
        }));
        lastSavedDataRef.current = currentData;
      }
    } catch (error) {
      toastService.addToast('Failed to save predictions', 'warning', 3000, '#ef4444');
    }
  }, [getIdentifier, positions, selectedPointsSystem, isDirty, dispatch]);

  useEffect(() => {
    const identifier = getIdentifier();
    if (!identifier || !isDirty) return;

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
  }, [getIdentifier, isDirty, save]);

  return { save, isInitialized };
};