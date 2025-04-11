import { useEffect } from 'react';
import { toggleOfficialResults } from '../store/slices/gridSlice';
import { calculateResults } from '../store/slices/resultsSlice';
// Past race results managed by Redux store
import useAppDispatch from './useAppDispatch';

/**
 * Custom hook to handle race results initialization
 */
export const useRaceResults = () => {
  const dispatch = useAppDispatch();

  // Initialize results on component mount
  useEffect(() => {
    // Make sure official results are displayed based on user preference
    const showOfficialResults = localStorage.getItem('hide-official-results') !== 'true';
    dispatch(toggleOfficialResults({ show: showOfficialResults }));
    
    // Recalculate standings
    dispatch(calculateResults());
  }, [dispatch]);

  // Return empty object since we're not using loading states anymore
  return {};
};

export default useRaceResults;