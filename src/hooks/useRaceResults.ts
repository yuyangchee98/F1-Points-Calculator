import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toggleOfficialResults } from '../store/slices/gridSlice';
import { calculateResults } from '../store/slices/resultsSlice';
import { fetchSeasonData } from '../store/slices/seasonDataSlice';
import { RootState } from '../store';
import { CURRENT_SEASON } from '../utils/constants';
// Past race results managed by Redux store
import useAppDispatch from './useAppDispatch';

/**
 * Custom hook to handle race results initialization
 */
export const useRaceResults = () => {
  const dispatch = useAppDispatch();
  const pastResults = useSelector((state: RootState) => state.seasonData.pastResults);

  // Initialize results on component mount
  useEffect(() => {
    // Fetch season data (schedule + results) from API
    dispatch(fetchSeasonData(CURRENT_SEASON));
  }, [dispatch]);

  // When pastResults are loaded, update the grid
  useEffect(() => {
    if (Object.keys(pastResults).length > 0) {
      // Make sure official results are displayed based on user preference
      const showOfficialResults = localStorage.getItem('hide-official-results') !== 'true';
      dispatch(toggleOfficialResults({ show: showOfficialResults, pastResults }));
      
      // Recalculate standings
      dispatch(calculateResults());
    }
  }, [dispatch, pastResults]);

  // Return empty object since we're not using loading states anymore
  return {};
};

export default useRaceResults;