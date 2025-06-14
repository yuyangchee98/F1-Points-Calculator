import React from 'react';
import { useSelector } from 'react-redux';
import { resetGrid, toggleOfficialResults } from '../../store/slices/gridSlice';
import { toggleOfficialResults as toggleOfficialResultsUI } from '../../store/slices/uiSlice';
import { calculateResults } from '../../store/slices/resultsSlice';
import { RootState } from '../../store';
import useAppDispatch from '../../hooks/useAppDispatch';
import { PredictionControls } from '../PredictionControls';

const ActionsBar: React.FC = () => {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const showOfficialResults = useSelector((state: RootState) => state.ui.showOfficialResults);

  // Handle grid reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your predictions?')) {
      dispatch(resetGrid());
      dispatch(calculateResults());
    }
  };

  // Handle toggling official results
  const handleToggleOfficialResults = () => {
    const newValue = !showOfficialResults;
    dispatch(toggleOfficialResultsUI(newValue));
    dispatch(toggleOfficialResults({ show: newValue }));
    dispatch(calculateResults());
  };

  return (
    <div className="mb-6">
      {/* Basic action buttons */}
      <div className="flex flex-wrap gap-4 mb-4">
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
      </div>
      
      {/* Prediction controls */}
      <PredictionControls />
    </div>
  );
};

export default ActionsBar;