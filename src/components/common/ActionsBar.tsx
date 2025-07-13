import React from 'react';
import { useSelector } from 'react-redux';
import { resetGrid, toggleOfficialResults } from '../../store/slices/gridSlice';
import { toggleOfficialResults as toggleOfficialResultsUI } from '../../store/slices/uiSlice';
import { calculateResults } from '../../store/slices/resultsSlice';
import { RootState } from '../../store';
import useAppDispatch from '../../hooks/useAppDispatch';
import PointsSystemSelector from './PointsSystemSelector';
import PointsReference from './PointsReference';
import { GA_EVENTS, trackEvent } from '../../utils/analytics';

const ActionsBar: React.FC = () => {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const showOfficialResults = useSelector((state: RootState) => state.ui.showOfficialResults);
  const pastResults = useSelector((state: RootState) => state.races.pastResults);

  // Handle grid reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your predictions?')) {
      dispatch(resetGrid());
      dispatch(calculateResults());
      trackEvent(GA_EVENTS.GRID_ACTIONS.RESET_PREDICTIONS, 'Grid Actions');
    }
  };

  // Handle toggling official results
  const handleToggleOfficialResults = () => {
    const newValue = !showOfficialResults;
    dispatch(toggleOfficialResultsUI(newValue));
    dispatch(toggleOfficialResults({ show: newValue, pastResults }));
    dispatch(calculateResults());
    trackEvent(
      GA_EVENTS.GRID_ACTIONS.TOGGLE_OFFICIAL, 
      'Grid Actions', 
      newValue ? 'show' : 'hide'
    );
  };

  return (
    <div className="mb-6">
      {/* Basic action buttons */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow transition"
        >
          Reset Predictions
        </button>
        
        <button
          onClick={handleToggleOfficialResults}
          className={`${
            showOfficialResults ? 'bg-green-600' : 'bg-gray-500'
          } hover:bg-opacity-90 text-white px-4 py-2 rounded-md shadow transition`}
        >
          {showOfficialResults ? 'Hide Official Results' : 'Show Official Results'}
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Points System:</span>
          <PointsSystemSelector />
        </div>
      </div>
      
      {/* Points Reference */}
      <PointsReference />
    </div>
  );
};

export default ActionsBar;