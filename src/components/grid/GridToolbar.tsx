import React, { useState, useEffect } from 'react';
import PointsSystemSelector from '../common/PointsSystemSelector';
import useWindowSize from '../../hooks/useWindowSize';

interface GridToolbarProps {
  onReset: () => void;
  onToggleOfficialResults: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenPredictions: () => void;
  showOfficialResults: boolean;
}

const GridToolbar: React.FC<GridToolbarProps> = ({
  onReset,
  onToggleOfficialResults,
  onOpenHistory,
  onOpenExport,
  onOpenPredictions,
  showOfficialResults,
}) => {
  const { isMobile, isTablet } = useWindowSize();
  const isCompact = isMobile || isTablet;
  const [showHowToUse, setShowHowToUse] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('infoBannerExpanded');
    if (savedState === 'true') {
      setShowHowToUse(true);
    }
  }, []);

  const toggleHowToUse = () => {
    const newState = !showHowToUse;
    setShowHowToUse(newState);
    localStorage.setItem('infoBannerExpanded', newState.toString());
  };

  return (
    <div className="bg-white border-b border-gray-200 rounded-t-lg">
      <div className="p-3 md:p-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Controls */}
          <div className="flex items-center gap-2">
            {!isCompact && <span className="text-sm text-gray-500 font-medium">Points:</span>}
            <PointsSystemSelector />
          </div>

          <button
            onClick={onToggleOfficialResults}
            className={`${
              showOfficialResults
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-300 text-gray-700'
            } border px-3 py-2 rounded-md hover:bg-opacity-80 transition-colors duration-200 flex items-center gap-2 font-medium text-sm`}
            title={showOfficialResults ? 'Hide Official Results' : 'Show Official Results'}
          >
            {showOfficialResults ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
            {!isCompact && <span>Results</span>}
          </button>

          {/* Utility Actions */}
          <button
            onClick={onOpenHistory}
            className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="Version History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCompact && <span>History</span>}
          </button>

          <button
            onClick={onOpenExport}
            className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="Export to Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {!isCompact && <span>Export</span>}
          </button>

          <button
            onClick={toggleHowToUse}
            className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="How to Use"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCompact && <span>Help</span>}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Primary Actions */}
          <button
            onClick={onOpenPredictions}
            className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="Lock & Score"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {!isCompact && <span>Lock & Score</span>}
          </button>

          <button
            onClick={onReset}
            className="bg-gray-50 border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
            title="Reset Predictions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {!isCompact && <span>Reset</span>}
          </button>
        </div>
      </div>

      {showHowToUse && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-gray-300 bg-blue-50">
          <div className="pt-3">
            <p className="text-gray-700 text-sm">
              💡 Click and drag drivers from the list to place them in their predicted finishing positions and get live points calculation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridToolbar;
