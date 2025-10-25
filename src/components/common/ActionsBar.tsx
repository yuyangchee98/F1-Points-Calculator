import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { resetGrid, toggleOfficialResults } from '../../store/slices/gridSlice';
import { toggleOfficialResults as toggleOfficialResultsUI } from '../../store/slices/uiSlice';
import { calculateResults } from '../../store/slices/resultsSlice';
import { RootState } from '../../store';
import useAppDispatch from '../../hooks/useAppDispatch';
import PointsSystemSelector from './PointsSystemSelector';
import PointsReference from './PointsReference';
import VersionHistory from './VersionHistory';
import { GA_EVENTS, trackEvent, trackVersionHistoryAction } from '../../utils/analytics';
import { loadPrediction } from '../../api/predictions';

const ActionsBar: React.FC = () => {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const showOfficialResults = useSelector((state: RootState) => state.ui.showOfficialResults);
  const pastResults = useSelector((state: RootState) => state.seasonData.pastResults);
  const { fingerprint } = useSelector((state: RootState) => state.predictions);
  const [showHistory, setShowHistory] = useState(false);

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

  // Handle loading a specific version
  const handleLoadVersion = async (version: string) => {
    if (!fingerprint) return;
    
    try {
      const prediction = await loadPrediction(fingerprint, version);
      if (prediction && prediction.grid) {
        // Clear current grid
        dispatch(resetGrid());
        
        // Load the version
        const { moveDriver } = await import('../../store/slices/gridSlice');
        prediction.grid.forEach(pos => {
          if (pos.driverId && !pos.isOfficialResult) {
            dispatch(moveDriver({
              driverId: pos.driverId,
              toRaceId: pos.raceId,
              toPosition: pos.position
            }));
          }
        });
        
        // Recalculate results
        dispatch(calculateResults());
        
        // Close history modal
        setShowHistory(false);
      }
    } catch (error) {
      // Error loading version
    }
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
        
        <button
          onClick={() => {
            setShowHistory(true);
            trackVersionHistoryAction('OPEN_HISTORY');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Points System:</span>
          <PointsSystemSelector />
        </div>
      </div>
      
      {/* Points Reference */}
      <PointsReference />
      
      {/* Version History Modal */}
      {showHistory && (
        <VersionHistory
          onClose={() => setShowHistory(false)}
          onLoadVersion={handleLoadVersion}
        />
      )}
    </div>
  );
};

export default ActionsBar;