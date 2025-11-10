import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toggleOfficialResults } from '../store/slices/gridSlice';
import { calculateResults } from '../store/slices/resultsSlice';
import { fetchSeasonData } from '../store/slices/seasonDataSlice';
import { RootState } from '../store';
import { getActiveSeason } from '../utils/constants';
import { useAppDispatch } from '../store';

export const useRaceResults = () => {
  const dispatch = useAppDispatch();
  const pastResults = useSelector((state: RootState) => state.seasonData.pastResults);

  useEffect(() => {
    dispatch(fetchSeasonData(getActiveSeason()));
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(pastResults).length > 0) {
      const showOfficialResults = localStorage.getItem('hide-official-results') !== 'true';
      dispatch(toggleOfficialResults({ show: showOfficialResults, pastResults }));

      dispatch(calculateResults());
    }
  }, [dispatch, pastResults]);

  return {};
};

export default useRaceResults;